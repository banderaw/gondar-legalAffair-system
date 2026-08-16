from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseDocumentViewSet

router = DefaultRouter()
router.register(r'', CaseDocumentViewSet, basename='casedocument')

urlpatterns = [
    path('', include(router.urls)),
]
