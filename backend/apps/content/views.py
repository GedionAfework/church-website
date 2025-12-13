from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, HeroSection, SocialFeedConfig
from .serializers import (
    BlogPostSerializer, BlogPostListSerializer,
    HeroSectionSerializer, SocialFeedConfigSerializer
)
from .permissions import (
    BlogPostPermission, HeroSectionPermission, SocialFeedConfigPermission
)


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.select_related('author').all()
    permission_classes = [BlogPostPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['published_at', 'created_at', 'title']
    ordering = ['-published_at', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # For public access, only show published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')
        elif not (self.request.user.is_superuser or 
                  self.request.user.has_perm('content.manage_blog_post')):
            # Non-admin users only see published posts
            queryset = queryset.filter(status='published')
        
        return queryset


class HeroSectionViewSet(viewsets.ModelViewSet):
    queryset = HeroSection.objects.all()
    serializer_class = HeroSectionSerializer
    permission_classes = [HeroSectionPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'layout']
    search_fields = ['title', 'subtitle']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the currently active hero section"""
        hero = HeroSection.get_active_hero()
        if hero:
            serializer = self.get_serializer(hero)
            return Response(serializer.data)
        return Response({'detail': 'No active hero section'}, status=status.HTTP_404_NOT_FOUND)


class SocialFeedConfigViewSet(viewsets.ModelViewSet):
    queryset = SocialFeedConfig.objects.all()
    serializer_class = SocialFeedConfigSerializer
    permission_classes = [SocialFeedConfigPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['platform', 'is_active']
    search_fields = ['handle_or_page_id']
    ordering_fields = ['platform', 'created_at']
    ordering = ['platform', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # For public access, only show active configs
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_active=True)
        
        return queryset
