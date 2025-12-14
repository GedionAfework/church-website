from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, HeroSection, SocialFeedConfig, Photo
from .serializers import (
    BlogPostSerializer, BlogPostListSerializer,
    HeroSectionSerializer, SocialFeedConfigSerializer, PhotoSerializer
)
from .permissions import (
    BlogPostPermission, HeroSectionPermission, SocialFeedConfigPermission, PhotoPermission
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

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        """Retrieve a blog post by slug with full content"""
        try:
            # Use select_related to load author relationship
            post = self.get_queryset().select_related('author').get(slug=slug)
            # Explicitly use BlogPostSerializer with request context for proper URL generation
            serializer = BlogPostSerializer(post, context={'request': request})
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response(
                {'detail': 'Blog post not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class HeroSectionViewSet(viewsets.ModelViewSet):
    queryset = HeroSection.objects.all()
    serializer_class = HeroSectionSerializer
    permission_classes = [HeroSectionPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['layout']
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
    filterset_fields = ['platform']
    search_fields = ['handle_or_page_id']
    ordering_fields = ['platform', 'created_at']
    ordering = ['platform', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        return queryset


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [PhotoPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['year']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'year', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        return queryset

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create photos from multiple images"""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not (request.user.is_superuser or request.user.has_perm('content.manage_photo')):
            return Response(
                {'detail': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        images = request.FILES.getlist('images')
        date = request.data.get('date')
        year = request.data.get('year')
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        if not images:
            return Response(
                {'detail': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not date:
            return Response(
                {'detail': 'Date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-populate year from date if not provided
        if not year and date:
            from datetime import datetime
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                year = date_obj.year
            except ValueError:
                return Response(
                    {'detail': 'Invalid date format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        created_photos = []
        errors = []
        
        for idx, image in enumerate(images):
            try:
                photo_data = {
                    'image': image,
                    'date': date,
                    'year': year,
                    'title': f"{title} {idx + 1}" if title else f"Photo {idx + 1}",
                    'description': description,
                }
                serializer = self.get_serializer(data=photo_data)
                serializer.is_valid(raise_exception=True)
                photo = serializer.save()
                created_photos.append(serializer.data)
            except Exception as e:
                errors.append(f"Image {idx + 1}: {str(e)}")
        
        return Response({
            'created': len(created_photos),
            'errors': errors,
            'photos': created_photos
        }, status=status.HTTP_201_CREATED if created_photos else status.HTTP_400_BAD_REQUEST)
