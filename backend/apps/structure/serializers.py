from rest_framework import serializers
from .models import Zone, ZoneGroup, ServiceDivision, ZoneLeader, ServiceLeader
from apps.members.serializers import MemberSerializer


class ZoneSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    zone_leader_name = serializers.SerializerMethodField()

    class Meta:
        model = Zone
        fields = [
            'id', 'name', 'description', 'location_hint',
            'is_active', 'members_count', 'zone_leader_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_zone_leader_name(self, obj):
        if hasattr(obj, 'zone_leader'):
            return obj.zone_leader.member.full_name
        return None


class ZoneGroupSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    group_type_display = serializers.CharField(source='get_group_type_display', read_only=True)

    class Meta:
        model = ZoneGroup
        fields = [
            'id', 'zone', 'zone_name', 'group_type',
            'group_type_display', 'name'
        ]


class ServiceDivisionSerializer(serializers.ModelSerializer):
    members_count = serializers.SerializerMethodField()
    service_leader_name = serializers.SerializerMethodField()

    class Meta:
        model = ServiceDivision
        fields = [
            'id', 'name', 'description', 'is_active',
            'members_count', 'service_leader_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.members.filter(is_active=True).count()

    def get_service_leader_name(self, obj):
        if hasattr(obj, 'service_leader'):
            return obj.service_leader.member.full_name
        return None


class ZoneLeaderSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=ZoneLeader._meta.get_field('member').related_model.objects.all(),
        source='member',
        write_only=True
    )
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = ZoneLeader
        fields = ['id', 'zone', 'zone_name', 'member', 'member_id']


class ServiceLeaderSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceLeader._meta.get_field('member').related_model.objects.all(),
        source='member',
        write_only=True
    )
    service_division_name = serializers.CharField(source='service_division.name', read_only=True)

    class Meta:
        model = ServiceLeader
        fields = ['id', 'service_division', 'service_division_name', 'member', 'member_id']

