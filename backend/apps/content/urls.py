from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, HeroSectionViewSet, SocialFeedConfigViewSet

router = DefaultRouter()
router.register(r'blog-posts', BlogPostViewSet, basename='blog-post')
router.register(r'hero-sections', HeroSectionViewSet, basename='hero-section')
router.register(r'social-feeds', SocialFeedConfigViewSet, basename='social-feed')

app_name = 'content'

urlpatterns = [
    path('', include(router.urls)),
]
