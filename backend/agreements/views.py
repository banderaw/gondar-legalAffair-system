from rest_framework import viewsets, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import ScholarshipAgreement
from .serializers import ScholarshipAgreementSerializer
from cases.permissions import IsAdminOrHead, IsLegalOfficer

User = get_user_model()


class ScholarshipAgreementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ScholarshipAgreement model with restricted permissions.
    Business Rule: "scholarship-related information shall only be accessible to authorized users"
    Only admin, head, and legal_officer roles can access scholarship agreements.
    Staff role is completely blocked from accessing this data.
    """
    queryset = ScholarshipAgreement.objects.select_related('case', 'supporting_document', 'created_by').all()
    serializer_class = ScholarshipAgreementSerializer

    def get_permissions(self):
        """
        Restrict access to admin, head, and legal_officer only.
        Staff role is completely blocked from scholarship agreement data.
        """
        permission_classes = [IsAdminOrHead | IsLegalOfficer]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Automatically set created_by"""
        serializer.save(created_by=self.request.user)
