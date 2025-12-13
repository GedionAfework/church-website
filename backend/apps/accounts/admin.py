from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User, Group
from .models import UserProfile


# Customize User admin to respect permissions
class UserAdmin(BaseUserAdmin):
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.view_user')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.add_user')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.change_user')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.delete_user')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        # Non-superusers can only see themselves unless they have view_user permission
        if not request.user.has_perm('auth.view_user'):
            return qs.filter(id=request.user.id)
        return qs


# Customize Group admin to respect permissions
class GroupAdmin(admin.ModelAdmin):
    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.view_group')
    
    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.add_group')
    
    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.change_group')
    
    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return request.user.has_perm('auth.delete_group')


# Unregister default admin and register with custom admin
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'father_name', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'father_name']
    readonly_fields = ['created_at', 'updated_at']


admin.site.unregister(User)
admin.site.register(User, UserAdmin)

admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)
