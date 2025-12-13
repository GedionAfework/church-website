from rest_framework import permissions


class ZonePermission(permissions.BasePermission):
    """Permission for Zone model"""
    
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.has_perm('structure.view_zone') or
                request.user.has_perm('structure.view_own_zone')
            )
        else:
            return (
                request.user.has_perm('structure.manage_zone') or
                request.user.has_perm('structure.manage_own_zone')
            )

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        # Check if user has full manage permission
        if request.user.has_perm('structure.manage_zone'):
            return True
        
        # Check if user is the zone leader
        if hasattr(obj, 'zone_leader') and obj.zone_leader:
            if obj.zone_leader.member.user == request.user:
                if request.method in permissions.SAFE_METHODS:
                    return request.user.has_perm('structure.view_own_zone')
                else:
                    return request.user.has_perm('structure.manage_own_zone')
        
        # Default permission check
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('structure.view_zone')
        
        return False


class ServiceDivisionPermission(permissions.BasePermission):
    """Permission for ServiceDivision model"""
    
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return (
                request.user.has_perm('structure.view_service_division') or
                request.user.has_perm('structure.view_own_service_division')
            )
        else:
            return (
                request.user.has_perm('structure.manage_service_division') or
                request.user.has_perm('structure.manage_own_service_division')
            )

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        # Check if user has full manage permission
        if request.user.has_perm('structure.manage_service_division'):
            return True
        
        # Check if user is the service leader
        if hasattr(obj, 'service_leader') and obj.service_leader:
            if obj.service_leader.member.user == request.user:
                if request.method in permissions.SAFE_METHODS:
                    return request.user.has_perm('structure.view_own_service_division')
                else:
                    return request.user.has_perm('structure.manage_own_service_division')
        
        # Default permission check
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('structure.view_service_division')
        
        return False

