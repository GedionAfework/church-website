from rest_framework import serializers
from .models import Member, Family, FamilyMember


class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    service_division_name = serializers.CharField(source='service_division.name', read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name',
            'gender', 'date_of_birth', 'phone', 'email', 'address',
            'zone', 'zone_name', 'service_division', 'service_division_name',
            'photo', 'is_active', 'is_staff_member', 'staff_title',
            'staff_bio', 'show_in_staff_page', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FamilyMemberSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        source='member',
        write_only=True
    )
    relationship_display = serializers.CharField(source='get_relationship_display', read_only=True)

    class Meta:
        model = FamilyMember
        fields = ['id', 'member', 'member_id', 'relationship', 'relationship_display']
        read_only_fields = ['id']


class FamilySerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()
    family_members = FamilyMemberSerializer(many=True, read_only=True)
    head_member_name = serializers.CharField(source='head_member.full_name', read_only=True)

    class Meta:
        model = Family
        fields = [
            'id', 'head_member', 'head_member_name', 'display_name',
            'family_members', 'created_at'
        ]
        read_only_fields = ['created_at', 'display_name']


class FamilyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating families with members"""
    members = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of members with their relationships: [{'member_id': 1, 'relationship': 'father'}]"
    )

    class Meta:
        model = Family
        fields = ['id', 'head_member', 'members', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        members_data = validated_data.pop('members', [])
        family = Family.objects.create(**validated_data)
        
        for member_data in members_data:
            FamilyMember.objects.create(
                family=family,
                member_id=member_data['member_id'],
                relationship=member_data['relationship']
            )
        
        return family

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)
        
        if members_data is not None:
            # Clear existing members and add new ones
            instance.family_members.all().delete()
            for member_data in members_data:
                FamilyMember.objects.create(
                    family=instance,
                    member_id=member_data['member_id'],
                    relationship=member_data['relationship']
                )
        
        return super().update(instance, validated_data)

