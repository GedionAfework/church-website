from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


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

