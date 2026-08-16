from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HearingViewSet, DeadlineViewSet

# Nested routers for case-specific resources
hearings_router = DefaultRouter()
hearings_router.register(r'', HearingViewSet, basename='case-hearing')

deadlines_router = DefaultRouter()
deadlines_router.register(r'', DeadlineViewSet, basename='case-deadline')

urlpatterns = [
    path('hearings/', include(hearings_router.urls)),
    path('deadlines/', include(deadlines_router.urls)),
]
