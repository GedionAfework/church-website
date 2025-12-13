from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, FamilyViewSet, FamilyMemberViewSet

router = DefaultRouter()
router.register(r'members', MemberViewSet, basename='member')
router.register(r'families', FamilyViewSet, basename='family')
router.register(r'family-members', FamilyMemberViewSet, basename='family-member')

app_name = 'members'

urlpatterns = [
    path('', include(router.urls)),
]
