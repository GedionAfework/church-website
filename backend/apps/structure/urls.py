from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ZoneViewSet, ZoneGroupViewSet, ServiceDivisionViewSet,
    ZoneLeaderViewSet, ServiceLeaderViewSet
)

router = DefaultRouter()
router.register(r'zones', ZoneViewSet, basename='zone')
router.register(r'zone-groups', ZoneGroupViewSet, basename='zone-group')
router.register(r'service-divisions', ServiceDivisionViewSet, basename='service-division')
router.register(r'zone-leaders', ZoneLeaderViewSet, basename='zone-leader')
router.register(r'service-leaders', ServiceLeaderViewSet, basename='service-leader')

app_name = 'structure'

urlpatterns = [
    path('', include(router.urls)),
]
