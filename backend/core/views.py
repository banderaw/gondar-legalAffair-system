from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import ProtectedError
from cases.permissions import IsAdminOrHead
from .models import Campus, Department, CaseCategory
from .serializers import CampusSerializer, DepartmentSerializer, CaseCategorySerializer
from cases.models import Case


class CampusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Campus model with admin CRUD operations.
    Read access for all users (including unauthenticated), write access for admins/heads only.
    """
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    permission_classes = []

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrHead()]
        return [AllowAny()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'Cannot delete campus that is referenced by departments or cases'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department model with admin CRUD operations.
    Read access for all users (including unauthenticated), write access for admins/heads only.
    """
    queryset = Department.objects.select_related('campus').all()
    serializer_class = DepartmentSerializer
    permission_classes = []

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrHead()]
        return [AllowAny()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'Cannot delete department that is referenced by cases'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CaseCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CaseCategory model with admin CRUD operations.
    Read access for all users (including unauthenticated), write access for admins/heads only.
    """
    queryset = CaseCategory.objects.all()
    serializer_class = CaseCategorySerializer
    permission_classes = []

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrHead()]
        return [AllowAny()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'Cannot delete category that is referenced by cases'},
                status=status.HTTP_400_BAD_REQUEST
            )
