from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'username': request.user.username,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
        })
    return Response({'authenticated': False})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
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
        is_active=True,
        start_date__isnull=False
    ).order_by('start_date')[:3]
    upcoming_heros_data = HeroSectionSerializer(upcoming_heros, many=True).data
    
    stats = {
        'members': {
            'total': Member.objects.count(),
            'active': Member.objects.filter(is_active=True).count(),
            'recent': recent_members_data
        },
        'families': {
            'total': Family.objects.count(),
            'recent': recent_families_data
        },
        'zones': {
            'total': Zone.objects.filter(is_active=True).count(),
        },
        'service_divisions': {
            'total': ServiceDivision.objects.filter(is_active=True).count(),
        },
        'hero_sections': {
            'active': HeroSection.objects.filter(is_active=True).count(),
            'upcoming': upcoming_heros_data
        }
    }
    
    return Response(stats)
