from rest_framework import permissions


class RolePermission(permissions.BasePermission):
    """Permission for Role (Group) management"""
    
    def has_permission(self, request, view):
        # Only superusers can manage roles
        if request.user.is_superuser:
            return True
        
        # For read operations, check if user has permission
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('auth.view_group')
        
        # For write operations, check if user has permission
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user.has_perm('auth.add_group') or request.user.has_perm('auth.change_group')
        
        if request.method == 'DELETE':
            return request.user.has_perm('auth.delete_group')
        
        return False


class UserPermission(permissions.BasePermission):
    """Permission for User management"""
    
    def has_permission(self, request, view):
        # Only superusers can manage users
        if request.user.is_superuser:
            return True
        
        # For read operations, check if user has permission
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('auth.view_user')
        
        # For write operations, check if user has permission
        if request.method in ['POST', 'PUT', 'PATCH']:
            return request.user.has_perm('auth.add_user') or request.user.has_perm('auth.change_user')
        
        if request.method == 'DELETE':
            return request.user.has_perm('auth.delete_user')
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Superusers can do everything
        if request.user.is_superuser:
            return True
        
        # Users cannot delete themselves
        if request.method == 'DELETE' and obj == request.user:
            return False
        
        # Users cannot change their own superuser status
        if request.method in ['PUT', 'PATCH'] and obj == request.user:
            # Allow updating own profile but not superuser status
            if 'is_superuser' in request.data and request.data['is_superuser'] != obj.is_superuser:
                return False
        
        return True

