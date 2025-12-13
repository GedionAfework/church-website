from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Zone, ZoneGroup, ServiceDivision, ZoneLeader, ServiceLeader, BibleStudyGroup
from .serializers import (
    ZoneSerializer, ZoneGroupSerializer, ServiceDivisionSerializer,
    ZoneLeaderSerializer, ServiceLeaderSerializer, BibleStudyGroupSerializer
)
from .permissions import ZonePermission, ServiceDivisionPermission


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.prefetch_related('members', 'zone_groups').all()
    serializer_class = ZoneSerializer
    permission_classes = [ZonePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = []
    search_fields = ['name', 'description', 'location_hint']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's zone if they are a zone leader
        if not self.request.user.is_superuser:
            from apps.structure.models import ZoneLeader
            try:
                zone_leader = ZoneLeader.objects.get(member__user=self.request.user)
                if self.request.user.has_perm('structure.view_own_zone'):
                    queryset = queryset.filter(id=zone_leader.zone.id)
            except ZoneLeader.DoesNotExist:
                pass
        
        return queryset

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members in a zone"""
        zone = self.get_object()
        from apps.members.serializers import MemberSerializer
        members = zone.members.all()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def groups(self, request, pk=None):
        """Get all zone groups"""
        zone = self.get_object()
        serializer = ZoneGroupSerializer(zone.zone_groups.all(), many=True)
        return Response(serializer.data)


class ZoneGroupViewSet(viewsets.ModelViewSet):
    queryset = ZoneGroup.objects.select_related('zone').all()
    serializer_class = ZoneGroupSerializer
    permission_classes = [ZonePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['zone', 'group_type']
    search_fields = ['name']
    ordering_fields = ['zone', 'group_type', 'name']
    ordering = ['zone', 'group_type', 'name']


class ServiceDivisionViewSet(viewsets.ModelViewSet):
    queryset = ServiceDivision.objects.prefetch_related('members').all()
    serializer_class = ServiceDivisionSerializer
    permission_classes = [ServiceDivisionPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = []
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's service division if they are a service leader
        if not self.request.user.is_superuser:
            from apps.structure.models import ServiceLeader
            try:
                service_leader = ServiceLeader.objects.get(member__user=self.request.user)
                if self.request.user.has_perm('structure.view_own_service_division'):
                    queryset = queryset.filter(id=service_leader.service_division.id)
            except ServiceLeader.DoesNotExist:
                pass
        
        return queryset

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members in a service division"""
        service_division = self.get_object()
        from apps.members.serializers import MemberSerializer
        members = service_division.members.all()
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)


class ZoneLeaderViewSet(viewsets.ModelViewSet):
    queryset = ZoneLeader.objects.select_related('zone', 'member').all()
    serializer_class = ZoneLeaderSerializer
    permission_classes = [ZonePermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['zone', 'member']
    ordering_fields = ['zone', 'member']
    ordering = ['zone', 'member']


class ServiceLeaderViewSet(viewsets.ModelViewSet):
    queryset = ServiceLeader.objects.select_related('service_division', 'member').all()
    serializer_class = ServiceLeaderSerializer
    permission_classes = [ServiceDivisionPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['service_division', 'member']
    ordering_fields = ['service_division', 'member']
    ordering = ['service_division', 'member']


class BibleStudyGroupViewSet(viewsets.ModelViewSet):
    queryset = BibleStudyGroup.objects.select_related('zone').prefetch_related('members', 'leaders').all()
    serializer_class = BibleStudyGroupSerializer
    permission_classes = [ZonePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['zone']
    search_fields = ['name', 'place_of_study']
    ordering_fields = ['zone', 'name', 'created_at']
    ordering = ['zone', 'name']
