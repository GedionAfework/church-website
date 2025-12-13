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

