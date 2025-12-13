from rest_framework import serializers
from .models import Zone, ZoneGroup, ServiceDivision, ZoneLeader, ServiceLeader, BibleStudyGroup
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
    member_detail = MemberSerializer(source='member', read_only=True)
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=ZoneLeader._meta.get_field('member').related_model.objects.all(),
        source='member',
        write_only=True
    )
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = ZoneLeader
        fields = ['id', 'zone', 'zone_name', 'member', 'member_detail', 'member_id']


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


class BibleStudyGroupSerializer(serializers.ModelSerializer):
    from apps.members.models import Member
    
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    members_detail = MemberSerializer(source='members', many=True, read_only=True)
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Member.objects.filter(is_active=True),
        required=False
    )
    leaders_detail = MemberSerializer(source='leaders', many=True, read_only=True)
    leaders = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Member.objects.filter(is_active=True),
        required=False
    )
    members_count = serializers.SerializerMethodField()
    leaders_count = serializers.SerializerMethodField()

    class Meta:
        model = BibleStudyGroup
        fields = [
            'id', 'zone', 'zone_name', 'name', 'place_of_study',
            'members', 'members_detail', 'members_count',
            'leaders', 'leaders_detail', 'leaders_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set queryset for members and leaders to only include members from the zone
        zone = None
        
        # Handle single instance (detail view or list view serialization)
        if self.instance:
            if hasattr(self.instance, 'zone'):
                zone = self.instance.zone
        # Handle initial_data (for create/update requests)
        elif hasattr(self, 'initial_data') and self.initial_data:
            if isinstance(self.initial_data, dict) and 'zone' in self.initial_data:
                from .models import Zone
                try:
                    zone_id = self.initial_data['zone']
                    if zone_id:
                        zone = Zone.objects.get(id=zone_id)
                except (Zone.DoesNotExist, TypeError, ValueError):
                    zone = None
        
        if zone:
            from apps.members.models import Member
            zone_members = Member.objects.filter(zone=zone, is_active=True)
            self.fields['members'].queryset = zone_members
            self.fields['leaders'].queryset = zone_members

    def get_members_count(self, obj):
        return obj.members.count()

    def get_leaders_count(self, obj):
        return obj.leaders.count()
