from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    GroupSerializer, GroupListSerializer, PermissionSerializer,
    UserSerializer, UserListSerializer
)
from .permissions import RolePermission, UserPermission


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Groups (Roles)
    """
    queryset = Group.objects.prefetch_related('permissions', 'user_set').all()
    permission_classes = [RolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return GroupListSerializer
        return GroupSerializer
    
    @action(detail=False, methods=['get'])
    def available_permissions(self, request):
        """
        Get all available permissions in the system, grouped by app and model
        """
        permissions = Permission.objects.select_related('content_type').all()
        
        # Group permissions by app and model
        grouped_permissions = {}
        for perm in permissions:
            app_label = perm.content_type.app_label
            model_name = perm.content_type.model
            key = f"{app_label}.{model_name}"
            
            if key not in grouped_permissions:
                grouped_permissions[key] = {
                    'app_label': app_label,
                    'model_name': model_name,
                    'permissions': []
                }
            
            grouped_permissions[key]['permissions'].append({
                'id': perm.id,
                'name': perm.name,
                'codename': perm.codename,
                'full_codename': f"{app_label}.{perm.codename}"
            })
        
        return Response({
            'grouped': grouped_permissions,
            'flat': PermissionSerializer(permissions, many=True).data
        })
    
    @action(detail=True, methods=['post'])
    def assign_permissions(self, request, pk=None):
        """
        Assign permissions to a role
        """
        group = self.get_object()
        permission_ids = request.data.get('permission_ids', [])
        
        if not isinstance(permission_ids, list):
            return Response(
                {'error': 'permission_ids must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        permissions = Permission.objects.filter(id__in=permission_ids)
        group.permissions.set(permissions)
        
        serializer = self.get_serializer(group)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """
        Get all users in this role
        """
        group = self.get_object()
        users = group.user_set.all()
        
        user_data = [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        } for user in users]
        
        return Response({
            'count': len(user_data),
            'users': user_data
        })


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for viewing available permissions
    """
    queryset = Permission.objects.select_related('content_type').all()
    serializer_class = PermissionSerializer
    permission_classes = [RolePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['content_type']
    search_fields = ['name', 'codename']


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Users
    """
    queryset = User.objects.prefetch_related('groups').all()
    permission_classes = [UserPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined', 'last_login']
    ordering = ['-date_joined']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by is_staff if requested
        is_staff = self.request.query_params.get('is_staff', None)
        if is_staff is not None:
            queryset = queryset.filter(is_staff=is_staff.lower() == 'true')
        
        
        # Filter by group if requested
        group = self.request.query_params.get('group', None)
        if group is not None:
            queryset = queryset.filter(groups__id=group)
        
        return queryset.distinct()


# Keep the original auth views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth(request):
    """Check if user is authenticated and return permissions"""
    if request.user.is_authenticated:
        # Get all user permissions (from groups and direct permissions)
        user_permissions = set()
        for group in request.user.groups.all():
            for perm in group.permissions.all():
                user_permissions.add(f"{perm.content_type.app_label}.{perm.codename}")
        # Add direct user permissions
        for perm in request.user.user_permissions.all():
            user_permissions.add(f"{perm.content_type.app_label}.{perm.codename}")
        
        # Get member_id if user is linked to a member
        member_id = None
        if hasattr(request.user, 'member_profile') and request.user.member_profile:
            member_id = request.user.member_profile.id
        
        return Response({
            'authenticated': True,
            'username': request.user.username,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
            'permissions': list(user_permissions),
            'member_id': member_id,
        })
    return Response({'authenticated': False})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics - requires accounts.view_dashboard permission"""
    # Check if user has permission to view dashboard
    if not (request.user.is_superuser or request.user.has_perm('accounts.view_dashboard')):
        return Response(
            {'detail': 'You do not have permission to view the dashboard.'},
            status=status.HTTP_403_FORBIDDEN
        )
    from apps.members.models import Member, Family
    from apps.members.serializers import MemberSerializer
    from apps.structure.models import Zone, ServiceDivision
    from apps.content.models import HeroSection
    from apps.content.serializers import HeroSectionSerializer
    
    # Get recent members
    recent_members = Member.objects.order_by('-created_at')[:5]
    recent_members_data = MemberSerializer(recent_members, many=True).data
    
    # Get recent families
    recent_families = Family.objects.order_by('-created_at')[:5]
    recent_families_data = []
    for family in recent_families:
        recent_families_data.append({
            'id': family.id,
            'display_name': family.display_name,
            'created_at': family.created_at
        })
    
    # Get upcoming hero sections
    upcoming_heros = HeroSection.objects.filter(
        start_date__isnull=False
    ).order_by('start_date')[:3]
    upcoming_heros_data = HeroSectionSerializer(upcoming_heros, many=True).data
    
    stats = {
        'members': {
            'total': Member.objects.count(),
            'recent': recent_members_data
        },
        'families': {
            'total': Family.objects.count(),
            'recent': recent_families_data
        },
        'zones': {
            'total': Zone.objects.count(),
        },
        'service_divisions': {
            'total': ServiceDivision.objects.count(),
        },
        'hero_sections': {
            'total': HeroSection.objects.count(),
            'upcoming': upcoming_heros_data
        }
    }
    
    return Response(stats)
