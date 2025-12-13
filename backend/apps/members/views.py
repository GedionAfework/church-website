from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Member, Family, FamilyMember
from .serializers import (
    MemberSerializer, FamilySerializer, FamilyCreateSerializer,
    FamilyMemberSerializer
)
from .permissions import MemberPermission, FamilyPermission


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.select_related('zone', 'service_division', 'user').all()
    serializer_class = MemberSerializer
    permission_classes = [MemberPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['zone', 'service_division', 'is_active', 'is_staff_member']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['first_name', 'last_name', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by zone if user is a zone leader
        if not self.request.user.is_superuser:
            from apps.structure.models import ZoneLeader
            try:
                zone_leader = ZoneLeader.objects.get(member__user=self.request.user)
                if self.request.user.has_perm('members.view_zone_members'):
                    queryset = queryset.filter(zone=zone_leader.zone)
            except ZoneLeader.DoesNotExist:
                pass
            
            # Filter by service division if user is a service leader
            from apps.structure.models import ServiceLeader
            try:
                service_leader = ServiceLeader.objects.get(member__user=self.request.user)
                if self.request.user.has_perm('members.view_service_members'):
                    queryset = queryset.filter(service_division=service_leader.service_division)
            except ServiceLeader.DoesNotExist:
                pass
        
        return queryset


class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.prefetch_related('family_members__member').all()
    permission_classes = [FamilyPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['head_member__first_name', 'head_member__last_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FamilyCreateSerializer
        return FamilySerializer

    @action(detail=True, methods=['post', 'delete'])
    def members(self, request, pk=None):
        """Add or remove members from a family"""
        family = self.get_object()
        
        if request.method == 'POST':
            member_id = request.data.get('member_id')
            relationship = request.data.get('relationship')
            
            if not member_id or not relationship:
                return Response(
                    {'error': 'member_id and relationship are required'},
                    status=400
                )
            
            FamilyMember.objects.get_or_create(
                family=family,
                member_id=member_id,
                defaults={'relationship': relationship}
            )
            
            return Response({'status': 'member added'})
        
        elif request.method == 'DELETE':
            member_id = request.data.get('member_id')
            if not member_id:
                return Response({'error': 'member_id is required'}, status=400)
            
            FamilyMember.objects.filter(
                family=family,
                member_id=member_id
            ).delete()
            
            return Response({'status': 'member removed'})


class FamilyMemberViewSet(viewsets.ModelViewSet):
    queryset = FamilyMember.objects.select_related('family', 'member').all()
    serializer_class = FamilyMemberSerializer
    permission_classes = [FamilyPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['family', 'member', 'relationship']
    ordering_fields = ['relationship', 'member__first_name']
    ordering = ['relationship', 'member__first_name']
