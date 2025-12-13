from rest_framework import permissions
from .models import Member


class MemberPermission(permissions.BasePermission):
    """
    Custom permission for Member model:
    - Superusers can do everything
    - Users with 'manage_member' permission can manage all members
    - Users with 'view_zone_members' can only view members in their zone
    - Users with 'manage_zone_members' can manage members in their zone
    - Users with 'view_service_members' can only view members in their service division
    - Users with 'manage_service_members' can manage members in their service division
    """

    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            # Check if user has any view permission
            return (
                request.user.has_perm('members.view_member') or
                request.user.has_perm('members.view_zone_members') or
                request.user.has_perm('members.view_service_members')
            )
        else:
            # Check if user has manage permission
            return (
                request.user.has_perm('members.manage_member') or
                request.user.has_perm('members.manage_zone_members') or
                request.user.has_perm('members.manage_service_members')
            )

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        
        # Check if user has full manage permission
        if request.user.has_perm('members.manage_member'):
            return True
        
        # Check zone-based permissions
        if obj.zone:
            from apps.structure.models import ZoneLeader
            try:
                zone_leader = ZoneLeader.objects.get(zone=obj.zone)
                if zone_leader.member.user == request.user:
                    if request.method in permissions.SAFE_METHODS:
                        return request.user.has_perm('members.view_zone_members')
                    else:
                        return request.user.has_perm('members.manage_zone_members')
            except ZoneLeader.DoesNotExist:
                pass
        
        # Check service division-based permissions
        if obj.service_division:
            from apps.structure.models import ServiceLeader
            try:
                service_leader = ServiceLeader.objects.get(service_division=obj.service_division)
                if service_leader.member.user == request.user:
                    if request.method in permissions.SAFE_METHODS:
                        return request.user.has_perm('members.view_service_members')
                    else:
                        return request.user.has_perm('members.manage_service_members')
            except ServiceLeader.DoesNotExist:
                pass
        
        # Default: check if user has view permission
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('members.view_member')
        
        return False


class FamilyPermission(permissions.BasePermission):
    """Permission for Family model"""
    
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('members.view_family')
        else:
            return request.user.has_perm('members.manage_family')

