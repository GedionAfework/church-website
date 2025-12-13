from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.password_validation import validate_password


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Permission model"""
    content_type_name = serializers.CharField(source='content_type.app_label', read_only=True)
    model_name = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type', 'content_type_name', 'model_name']
        read_only_fields = ['id', 'name', 'codename', 'content_type']


class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group (Role) model"""
    permissions_detail = PermissionSerializer(source='permissions', many=True, read_only=True)
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permissions_detail', 'user_count']
    
    def get_user_count(self, obj):
        """Get the number of users in this group"""
        return obj.user_set.count()


class GroupListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing groups"""
    permission_count = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permission_count', 'user_count']
    
    def get_permission_count(self, obj):
        """Get the number of permissions in this group"""
        return obj.permissions.count()
    
    def get_user_count(self, obj):
        """Get the number of users in this group"""
        return obj.user_set.count()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    groups_detail = GroupListSerializer(source='groups', many=True, read_only=True)
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all(),
        required=False
    )
    password = serializers.CharField(write_only=True, required=False)
    
    father_name = serializers.SerializerMethodField()
    father_name_input = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    member_id = serializers.IntegerField(required=False, write_only=True, allow_null=True)
    member_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'father_name', 'father_name_input', 'last_name',
            'is_superuser', 'date_joined',
            'last_login', 'groups', 'groups_detail', 'password', 'member_id', 'member_name'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
    
    def get_father_name(self, obj):
        """Get father's name from user profile"""
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.father_name or ''
        # Fallback to member profile if user profile doesn't exist
        if hasattr(obj, 'member_profile') and obj.member_profile:
            return obj.member_profile.father_name or ''
        return ''
    
    def get_member_name(self, obj):
        """Get member name if user is linked to a member"""
        if hasattr(obj, 'member_profile') and obj.member_profile:
            return obj.member_profile.full_name
        return None
    
    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        password = validated_data.pop('password', None)
        member_id = validated_data.pop('member_id', None)
        father_name = self.initial_data.get('father_name', None) or self.initial_data.get('father_name_input', None)  # Get from initial_data
        
        if not password:
            raise serializers.ValidationError({'password': ['Password is required for new users']})
        
        # Validate password using Django's password validators
        try:
            from django.core.exceptions import ValidationError as DjangoValidationError
            validate_password(password)
        except DjangoValidationError as e:
            # Convert validation errors to a list of strings
            if hasattr(e, 'messages'):
                raise serializers.ValidationError({'password': e.messages})
            elif hasattr(e, 'error_list'):
                raise serializers.ValidationError({'password': [str(err) for err in e.error_list]})
            else:
                raise serializers.ValidationError({'password': [str(e)]})
        except Exception as e:
            # Fallback for any other exceptions
            raise serializers.ValidationError({'password': [str(e)]})
        
        # If member_id is provided, get member data and link user to member
        if member_id:
            from apps.members.models import Member
            try:
                member = Member.objects.get(id=member_id)
                # If member already has a user, raise error
                if member.user:
                    raise serializers.ValidationError({
                        'member_id': f'Member {member.full_name} already has a user account'
                    })
                # Populate user data from member
                validated_data.setdefault('first_name', member.first_name)
                validated_data.setdefault('last_name', member.last_name)
                validated_data.setdefault('email', member.email or '')
                # Use member's father_name if not provided
                if not father_name and member.father_name:
                    father_name = member.father_name
            except Member.DoesNotExist:
                raise serializers.ValidationError({'member_id': 'Member not found'})
        
        # Remove is_staff and is_active from validated_data before creating user
        validated_data.pop('is_staff', None)
        validated_data.pop('is_active', None)
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.is_staff = False  # Always False
        user.is_active = True  # Always True
        user.save()
        
        # Create user profile with father_name
        from apps.accounts.models import UserProfile
        UserProfile.objects.create(
            user=user,
            father_name=father_name or ''
        )
        
        # Link user to member if member_id was provided
        if member_id:
            member.user = user
            member.save()
        
        if groups:
            user.groups.set(groups)
        
        return user
    
    def update(self, instance, validated_data):
        groups = validated_data.pop('groups', None)
        password = validated_data.pop('password', None)
        father_name = self.initial_data.get('father_name', None) or self.initial_data.get('father_name_input', None)  # Get from initial_data
        member_id = validated_data.pop('member_id', None)
        
        # Update user fields (exclude member_id, is_staff, is_active)
        for attr, value in validated_data.items():
            if attr not in ['member_id', 'is_staff', 'is_active']:
                setattr(instance, attr, value)
        
        # Always set is_staff=False and is_active=True
        instance.is_staff = False
        instance.is_active = True
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update or create user profile with father_name
        from apps.accounts.models import UserProfile
        if father_name is not None:  # Only update if father_name is provided
            UserProfile.objects.update_or_create(
                user=instance,
                defaults={'father_name': father_name or ''}
            )
        
        # Update groups if provided
        if groups is not None:
            instance.groups.set(groups)
        
        # Link to member if member_id provided
        if member_id:
            from apps.members.models import Member
            try:
                member = Member.objects.get(id=member_id)
                # If member already has a different user, raise error
                if member.user and member.user != instance:
                    raise serializers.ValidationError({
                        'member_id': f'Member {member.full_name} is already linked to another user'
                    })
                member.user = instance
                member.save()
            except Member.DoesNotExist:
                raise serializers.ValidationError({'member_id': 'Member not found'})
        
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing users"""
    groups_count = serializers.SerializerMethodField()
    groups_names = serializers.SerializerMethodField()
    father_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'father_name', 'last_name',
            'is_superuser', 'groups_count', 'groups_names'
        ]
    
    def get_father_name(self, obj):
        """Get father's name from user profile"""
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.father_name or ''
        # Fallback to member profile if user profile doesn't exist
        if hasattr(obj, 'member_profile') and obj.member_profile:
            return obj.member_profile.father_name or ''
        return ''
    
    def get_groups_count(self, obj):
        """Get the number of groups this user belongs to"""
        return obj.groups.count()
    
    def get_groups_names(self, obj):
        """Get the names of groups this user belongs to"""
        return [group.name for group in obj.groups.all()]

