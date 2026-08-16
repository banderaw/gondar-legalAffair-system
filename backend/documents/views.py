from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import CaseDocument
from .serializers import CaseDocumentSerializer
from cases.permissions import IsAdminOrHead, IsLegalOfficer, IsStaff
from cases.models import Case

User = get_user_model()


class CaseDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CaseDocument model with case-scoped permissions.
    Documents are only visible to users who can view the parent case.
    Reuses case permission logic from cases app.
    """
    serializer_class = CaseDocumentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case', 'is_confidential']

    def get_queryset(self):
        """Filter documents based on user's access to parent case"""
        user = self.request.user
        case_id = self.kwargs.get('case_id')
        
        # If case_id is provided, filter for that specific case
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return CaseDocument.objects.none()
            
            # Apply same permission logic as CaseViewSet
            if user.role == 'legal_officer':
                if case.assigned_officer != user:
                    return CaseDocument.objects.none()
            elif user.role == 'staff':
                if case.registered_by != user:
                    return CaseDocument.objects.none()
            
            return CaseDocument.objects.filter(case_id=case_id).select_related('uploaded_by', 'case')
        
        # If no case_id, return all documents user can access
        if user.role == 'legal_officer':
            # Legal officers can only see documents for their assigned cases
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            # Staff can only see documents for cases they registered
            accessible_cases = Case.objects.filter(registered_by=user)
        else:
            # Admin and head can see all documents
            accessible_cases = Case.objects.all()
        
        queryset = CaseDocument.objects.filter(case__in=accessible_cases).select_related('uploaded_by', 'case')
        
        # Filter confidential documents - only admin/head/assigned_officer can see
        if user.role == 'legal_officer':
            queryset = queryset.filter(
                Q(is_confidential=False) | Q(case__assigned_officer=user)
            )
        elif user.role == 'staff':
            queryset = queryset.filter(is_confidential=False)
        
        return queryset

    def get_permissions(self):
        """Apply same permission logic as CaseViewSet"""
        if self.action in ['create', 'destroy']:
            # Only admin/head can create or delete documents
            permission_classes = [IsAdminOrHead]
        elif self.action in ['update', 'partial_update']:
            # Admin/head can update any, legal officers can update documents for their assigned cases
            permission_classes = [IsAdminOrHead | IsLegalOfficer]
        else:
            # All authenticated users can view based on their case access
            permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Automatically set uploaded_by and case"""
        case_id = self.kwargs.get('case_id')
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response(
                {'error': 'Case not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer.save(uploaded_by=self.request.user, case=case)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download endpoint for document files.
        Only accessible to users who can view the parent case.
        """
        document = self.get_object()
        # Permission check is handled by get_queryset
        return Response({
            'file_url': request.build_absolute_uri(document.file.url),
            'title': document.title,
            'content_type': document.file.content_type if hasattr(document.file, 'content_type') else 'application/octet-stream'
        })
