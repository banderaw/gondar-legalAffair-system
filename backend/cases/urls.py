from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseViewSet

router = DefaultRouter()
router.register(r'', CaseViewSet, basename='case')

urlpatterns = [
    path('', include(router.urls)),
    # Nested routes for case-related resources
    path('<int:case_id>/documents/', include('documents.urls')),
    path('<int:case_id>/', include('hearings.nested_urls')),
]
