from django.contrib import admin
from .models import Zone, ZoneGroup, ServiceDivision, ZoneLeader, ServiceLeader


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = []
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_zone') or
            request.user.has_perm('structure.view_own_zone')
        )
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_zone') or
            request.user.has_perm('structure.manage_own_zone')
        )
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_zone') or
            request.user.has_perm('structure.manage_own_zone')
        )
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by user's zone if they have limited permissions
        if request.user.has_perm('structure.view_own_zone') or request.user.has_perm('structure.manage_own_zone'):
            if hasattr(request.user, 'member_profile') and request.user.member_profile and request.user.member_profile.zone:
                return qs.filter(id=request.user.member_profile.zone.id)
        return qs


@admin.register(ZoneGroup)
class ZoneGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'zone', 'group_type']
    list_filter = ['group_type', 'zone']
    search_fields = ['name', 'zone__name']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_group')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_group')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_group')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_group')


@admin.register(ServiceDivision)
class ServiceDivisionAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = []
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_service_division') or
            request.user.has_perm('structure.view_own_service_division')
        )
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_service_division') or
            request.user.has_perm('structure.manage_own_service_division')
        )
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return (
            request.user.has_perm('structure.manage_service_division') or
            request.user.has_perm('structure.manage_own_service_division')
        )
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_service_division')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Filter by user's service division if they have limited permissions
        if request.user.has_perm('structure.view_own_service_division') or request.user.has_perm('structure.manage_own_service_division'):
            if hasattr(request.user, 'member_profile') and request.user.member_profile and request.user.member_profile.service_division:
                return qs.filter(id=request.user.member_profile.service_division.id)
        return qs


@admin.register(ZoneLeader)
class ZoneLeaderAdmin(admin.ModelAdmin):
    list_display = ['member', 'zone']
    list_filter = ['zone']
    search_fields = ['member__first_name', 'member__last_name', 'zone__name']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_leader')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_leader')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_leader')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_zone_leader')


@admin.register(ServiceLeader)
class ServiceLeaderAdmin(admin.ModelAdmin):
    list_display = ['member', 'service_division']
    list_filter = ['service_division']
    search_fields = ['member__first_name', 'member__last_name', 'service_division__name']
    
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_service_leader')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_service_leader')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_service_leader')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('structure.manage_service_leader')
