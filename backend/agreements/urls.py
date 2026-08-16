from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScholarshipAgreementViewSet

router = DefaultRouter()
router.register(r'', ScholarshipAgreementViewSet, basename='scholarship-agreement')

urlpatterns = [
    path('', include(router.urls)),
]
