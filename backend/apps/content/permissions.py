from rest_framework import permissions


class BlogPostPermission(permissions.BasePermission):
    """Permission for BlogPost model"""
    
    def has_permission(self, request, view):
        # Public can view published posts
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users with permission can manage
        if request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            return request.user.has_perm('content.manage_blog_post')
        
        return False

    def has_object_permission(self, request, view, obj):
        # Anyone can view published posts
        if request.method in permissions.SAFE_METHODS:
            if obj.status == 'published':
                return True
            # Only authenticated users can view drafts
            if request.user.is_authenticated:
                if request.user.is_superuser:
                    return True
                return request.user.has_perm('content.manage_blog_post')
            return False
        
        # Only authenticated users with permission can manage
        if request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            return request.user.has_perm('content.manage_blog_post')
        
        return False


class HeroSectionPermission(permissions.BasePermission):
    """Permission for HeroSection model"""
    
    def has_permission(self, request, view):
        # Public can view active hero
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users with permission can manage
        if request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            return request.user.has_perm('content.manage_hero_section')
        
        return False


class SocialFeedConfigPermission(permissions.BasePermission):
    """Permission for SocialFeedConfig model"""
    
    def has_permission(self, request, view):
        # Public can view active configs
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users with permission can manage
        if request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            return request.user.has_perm('content.manage_social_feed_config')
        
        return False


class PhotoPermission(permissions.BasePermission):
    """Permission for Photo model"""
    
    def has_permission(self, request, view):
        # Public can view active photos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only authenticated users with permission can manage
        if request.user.is_authenticated:
            if request.user.is_superuser:
                return True
            return request.user.has_perm('content.manage_photo')
        
        return False

