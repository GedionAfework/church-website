from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, check_auth, dashboard_stats

app_name = 'accounts'

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/check/', check_auth, name='check_auth'),
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
]
