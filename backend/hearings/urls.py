from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HearingViewSet, DeadlineViewSet, UpcomingHearingsViewSet, UpcomingDeadlinesViewSet

# Main CRUD endpoints
router = DefaultRouter()
router.register(r'hearings', HearingViewSet, basename='hearing')
router.register(r'deadlines', DeadlineViewSet, basename='deadline')

# Top-level upcoming endpoints
upcoming_router = DefaultRouter()
upcoming_router.register(r'hearings/upcoming', UpcomingHearingsViewSet, basename='upcoming-hearing')
upcoming_router.register(r'deadlines/upcoming', UpcomingDeadlinesViewSet, basename='upcoming-deadline')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(upcoming_router.urls)),
]
