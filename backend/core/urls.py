from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampusViewSet, DepartmentViewSet, CaseCategoryViewSet

router = DefaultRouter()
router.register(r'campuses', CampusViewSet, basename='campus')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'case-categories', CaseCategoryViewSet, basename='case-category')

urlpatterns = [
    path('', include(router.urls)),
]
