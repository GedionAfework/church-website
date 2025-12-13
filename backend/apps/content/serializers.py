from rest_framework import serializers
from .models import BlogPost, HeroSection, SocialFeedConfig
from apps.members.serializers import MemberSerializer


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'author_name',
            'status', 'status_display', 'published_at', 'thumbnail_image',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for blog post lists"""
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'author_name', 'status',
            'published_at', 'thumbnail_image', 'excerpt', 'created_at'
        ]
        read_only_fields = ['slug', 'created_at']

    def get_excerpt(self, obj):
        """Return first 200 characters of content"""
        if obj.content:
            return obj.content[:200] + '...' if len(obj.content) > 200 else obj.content
        return ''


class HeroSectionSerializer(serializers.ModelSerializer):
    layout_display = serializers.CharField(source='get_layout_display', read_only=True)
    text_alignment_display = serializers.CharField(source='get_text_alignment_display', read_only=True)
    button_variant_display = serializers.CharField(source='get_button_variant_display', read_only=True)

    class Meta:
        model = HeroSection
        fields = [
            'id', 'title', 'subtitle', 'background_image', 'button_text',
            'button_link', 'start_date', 'end_date', 'is_active',
            'layout', 'layout_display', 'text_alignment', 'text_alignment_display',
            'button_variant', 'button_variant_display', 'title_color',
            'subtitle_color', 'overlay_opacity', 'extra_classes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'background_image': {'required': True, 'allow_null': False},
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_background_image(self, value):
        """Ensure background_image is provided"""
        if not value:
            raise serializers.ValidationError("Background image is required.")
        return value


class SocialFeedConfigSerializer(serializers.ModelSerializer):
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = SocialFeedConfig
        fields = [
            'id', 'platform', 'platform_display', 'handle_or_page_id',
            'api_key_or_token', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'api_key_or_token': {'write_only': True}  # Don't expose API keys in responses
        }

