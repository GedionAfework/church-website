from django.contrib import admin
from .models import Member, Family, FamilyMember


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'zone', 'service_division', 'is_active', 'is_staff_member']
    list_filter = ['is_active', 'is_staff_member', 'zone', 'service_division', 'gender']
    search_fields = ['first_name', 'last_name', 'father_name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('members.view_member') or
            request.user.has_perm('members.view_zone_members') or
            request.user.has_perm('members.view_service_members')
        )
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('members.manage_member') or
            request.user.has_perm('members.manage_zone_members') or
            request.user.has_perm('members.manage_service_members')
        )
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if not obj:
            return self.has_add_permission(request)
        return (
            request.user.has_perm('members.manage_member') or
            request.user.has_perm('members.manage_zone_members') or
            request.user.has_perm('members.manage_service_members')
        )
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('members.manage_member') or
            request.user.has_perm('members.manage_zone_members') or
            request.user.has_perm('members.manage_service_members')
        )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by zone or service division if user has limited permissions
        if request.user.has_perm('members.view_zone_members') or request.user.has_perm('members.manage_zone_members'):
            # Get user's member profile to find their zone
            if hasattr(request.user, 'member_profile') and request.user.member_profile and request.user.member_profile.zone:
                return qs.filter(zone=request.user.member_profile.zone)
        if request.user.has_perm('members.view_service_members') or request.user.has_perm('members.manage_service_members'):
            # Get user's member profile to find their service division
            if hasattr(request.user, 'member_profile') and request.user.member_profile and request.user.member_profile.service_division:
                return qs.filter(service_division=request.user.member_profile.service_division)
        return qs


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'head_member', 'created_at']
    search_fields = ['head_member__first_name', 'head_member__last_name']
    readonly_fields = ['created_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family') or request.user.has_perm('members.view_member')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family')


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):
    list_display = ['member', 'family', 'relationship']
    list_filter = ['relationship']
    search_fields = ['member__first_name', 'member__last_name', 'family__display_name']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family_member') or request.user.has_perm('members.view_member')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family_member')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family_member')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('members.manage_family_member')
