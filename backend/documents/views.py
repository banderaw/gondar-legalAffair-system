from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import CaseDocument
from .serializers import CaseDocumentSerializer
from cases.permissions import IsAdminOrHead, IsLegalOfficer, IsReporter
from cases.models import Case

User = get_user_model()


class CaseDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CaseDocument model with case-scoped permissions.
    GET /api/documents/?case={id} - list documents for a case
    POST /api/documents/ - multipart upload (admin/head/assigned-officer only)
    GET /api/documents/{id}/download/ - download file
    DELETE /api/documents/{id}/ - admin/head only
    """
    serializer_class = CaseDocumentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case']

    def get_queryset(self):
        """Filter documents based on user's access to parent case"""
        user = self.request.user
        case_id = self.request.query_params.get('case')
        
        # If case_id is provided, filter for that specific case
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return CaseDocument.objects.none()
            
            # Apply permission logic
            if user.role == 'legal_officer':
                if case.assigned_officer != user:
                    return CaseDocument.objects.none()
            elif user.role == 'reporter':
                if case.registered_by != user:
                    return CaseDocument.objects.none()
            
            queryset = CaseDocument.objects.filter(case_id=case_id).select_related('uploaded_by', 'case')
            
            # Filter confidential documents - only admin/head/assigned_officer can see
            if user.role == 'legal_officer':
                queryset = queryset.filter(
                    Q(is_confidential=False) | Q(case__assigned_officer=user)
                )
            elif user.role == 'reporter':
                queryset = queryset.filter(is_confidential=False)
            
            return queryset
        
        # If no case_id, return all documents user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'reporter':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:
            accessible_cases = Case.objects.all()
        
        queryset = CaseDocument.objects.filter(case__in=accessible_cases).select_related('uploaded_by', 'case')
        
        # Filter confidential documents
        if user.role == 'legal_officer':
            queryset = queryset.filter(
                Q(is_confidential=False) | Q(case__assigned_officer=user)
            )
        elif user.role == 'staff':
            queryset = queryset.filter(is_confidential=False)
        
        return queryset

    def get_permissions(self):
        """Apply permission logic"""
        if self.action == 'destroy':
            # Only admin/head can delete
            permission_classes = [IsAdminOrHead]
        elif self.action == 'create':
            # Admin/head can create, legal officers can create for their assigned cases
            permission_classes = [IsAdminOrHead | IsLegalOfficer]
        else:
            # All authenticated users can view based on their case access
            permission_classes = [IsAdminOrHead | IsLegalOfficer | IsReporter]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Validate case access and set uploaded_by"""
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
                raise serializers.ValidationError({'case': 'You can only upload documents to cases assigned to you.'})
        elif self.request.user.role == 'reporter':
            if case.registered_by != self.request.user:
                raise serializers.ValidationError({'case': 'You can only upload documents to cases you registered.'})
        
        serializer.save(uploaded_by=self.request.user, case=case)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download endpoint for document files.
        Returns actual file for download.
        """
        document = self.get_object()
        
        if not document.file:
            raise Http404("File not found")
        
        try:
            return FileResponse(
                document.file.open('rb'),
                as_attachment=True,
                filename=document.title
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to download file: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
