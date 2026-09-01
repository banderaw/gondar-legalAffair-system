from rest_framework import viewsets, status, serializers
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from .models import ScholarshipAgreement
from .serializers import ScholarshipAgreementSerializer
from cases.permissions import IsAdminOrHead, IsLegalOfficer
from cases.models import Case

User = get_user_model()


class ScholarshipAgreementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ScholarshipAgreement model with restricted permissions.
    GET /api/agreements/?case={id} - returns single agreement for case (or empty)
    POST /api/agreements/ - fields: case, sponsored_person, sponsorship_start_date, sponsorship_end_date, total_amount, guarantee_details, supporting_document
    Scoping: admin/head/assigned-officer only - 403 for others
    """
    serializer_class = ScholarshipAgreementSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case']

    def get_queryset(self):
        """Filter agreements based on user's access to parent case"""
        user = self.request.user
        case_id = self.request.query_params.get('case')
        
        # If case_id is provided, filter for that specific case
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return ScholarshipAgreement.objects.none()
            
            # Apply permission logic - only admin/head/assigned-officer can access
            if user.role == 'legal_officer':
                if case.assigned_officer != user:
                    return ScholarshipAgreement.objects.none()
            
            return ScholarshipAgreement.objects.filter(case_id=case_id).select_related('case', 'supporting_document', 'created_by')
        
        # If no case_id, return all agreements user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        else:
            accessible_cases = Case.objects.all()
        
        return ScholarshipAgreement.objects.filter(case__in=accessible_cases).select_related('case', 'supporting_document', 'created_by')

    def get_permissions(self):
        """
        Restrict access to admin, head, and legal_officer only.
        Reporter role is completely blocked from scholarship agreement data.
        """
        permission_classes = [IsAdminOrHead | IsLegalOfficer]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Validate case access and set created_by"""
        case_id = self.request.data.get('case')
        if not case_id:
            raise serializers.ValidationError({'case': 'This field is required.'})
        
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            raise serializers.ValidationError({'case': 'Case not found.'})
        
        # Check if user can access this case
        if self.request.user.role == 'legal_officer':
            if case.assigned_officer != self.request.user:
                raise serializers.ValidationError({'case': 'You can only create agreements for cases assigned to you.'})
        
        serializer.save(created_by=self.request.user, case=case)
