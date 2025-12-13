from django.contrib import admin
from .models import BlogPost, HeroSection, SocialFeedConfig


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'published_at', 'created_at']
    list_filter = ['status', 'published_at', 'created_at']
    search_fields = ['title', 'content', 'author__first_name', 'author__last_name']
    readonly_fields = ['created_at', 'updated_at', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_blog_post')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_blog_post')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_blog_post')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_blog_post')


@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'start_date', 'end_date', 'created_at']
    list_filter = ['is_active', 'layout', 'text_alignment']
    search_fields = ['title', 'subtitle']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_hero_section')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_hero_section')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_hero_section')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_hero_section')


@admin.register(SocialFeedConfig)
class SocialFeedConfigAdmin(admin.ModelAdmin):
    list_display = ['platform', 'handle_or_page_id', 'is_active', 'created_at']
    list_filter = ['platform', 'is_active']
    search_fields = ['handle_or_page_id']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_social_feed_config')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_social_feed_config')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_social_feed_config')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('content.manage_social_feed_config')
