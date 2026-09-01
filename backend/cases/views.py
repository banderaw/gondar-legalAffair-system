from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import Case, CaseHistory
from .serializers import CaseListSerializer, CaseDetailSerializer, CaseHistorySerializer
from .permissions import IsAdminOrHead, IsLegalOfficer, CanAssignCase, CanUpdateCaseStatus, IsReporter
from notifications.models import Notification
from django.db.models import Q

User = get_user_model()


class CaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Case model with role-based permissions and filtering.
    Provides CRUD operations and custom actions for case management.
    """
    queryset = Case.objects.select_related('category', 'campus', 'department', 'assigned_officer', 'registered_by').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'campus', 'department', 'assigned_officer']
    search_fields = ['case_id', 'title']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list' and self.request.user.role == 'reporter':
            return CaseListSerializer  # Reuse CaseListSerializer for reporters (lightweight)
        elif self.action == 'list':
            return CaseListSerializer
        return CaseDetailSerializer

    def get_permissions(self):
        """Apply role-based permissions based on action"""
        if self.action == 'create':
            # Only reporters can create cases
            permission_classes = [IsReporter]
        elif self.action == 'destroy':
            # Only admin/head can delete cases
            permission_classes = [IsAdminOrHead]
        elif self.action in ['update', 'partial_update']:
            # Admin/head can update any, legal officers can update their assigned cases
            permission_classes = [IsAdminOrHead | IsLegalOfficer]
        elif self.action == 'assign':
            # Only admin/head can assign cases
            permission_classes = [IsAdminOrHead]
        elif self.action == 'update_status':
            # Only the assigned legal officer can update status
            permission_classes = [CanUpdateCaseStatus]
        else:
            # All authenticated users can view based on their role
            permission_classes = [IsAdminOrHead | IsLegalOfficer | IsReporter]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == 'legal_officer':
            # Legal officers can only see their assigned cases
            return queryset.filter(assigned_officer=user)
        elif user.role == 'reporter':
            # Reporters can only see cases they registered
            return queryset.filter(registered_by=user)
        # Admin and head can see all cases
        return queryset

    def perform_create(self, serializer):
        """Set registered_by to the current user when creating a case"""
        # Rate limiting for reporters: max 5 cases per 24 hours
        if self.request.user.role == 'reporter':
            twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
            recent_cases = Case.objects.filter(
                registered_by=self.request.user,
                created_at__gte=twenty_four_hours_ago
            ).count()
            
            if recent_cases >= 5:
                raise serializers.ValidationError({
                    'detail': "You've reached the daily limit for case submissions. Please try again tomorrow or contact the office directly for urgent matters."
                })
        
        case = serializer.save(registered_by=self.request.user)
        
        # Handle file attachments from initial submission
        attachments = self.request.FILES.getlist('attachments')
        if attachments:
            from documents.models import CaseDocument
            
            for file in attachments:
                CaseDocument.objects.create(
                    case=case,
                    file=file,
                    title=file.name,
                    uploaded_by=self.request.user,
                    is_confidential=False,  # Reporters cannot mark files as confidential
                    source='initial_submission'
                )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrHead])
    def assign(self, request, pk=None):
        """
        Assign a case to a legal officer.
        Business Rule: "Only authorized users shall be permitted to assign cases"
        Business Rule: "the responsible legal officer shall receive a system notification when a case is assigned."
        """
        case = self.get_object()
        officer_id = request.data.get('officer_id')

        if not officer_id:
            return Response(
                {'error': 'officer_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            officer = User.objects.get(id=officer_id, role='legal_officer')
        except User.DoesNotExist:
            return Response(
                {'error': 'Legal officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update case assignment
        previous_officer = case.assigned_officer
        case.assigned_officer = officer
        case.save()

        # Write to CaseHistory
        action_description = f"Case assigned from {previous_officer.username if previous_officer else 'unassigned'} to {officer.username}"
        CaseHistory.objects.create(
            case=case,
            user=request.user,
            action='Case Assigned',
            description=action_description
        )

        # Create notification for the assigned officer
        Notification.objects.create(
            recipient=officer,
            message=f"You have been assigned to case {case.case_id}: {case.title}"
        )

        return Response(
            {'message': f'Case assigned to {officer.username}', 'case_id': case.case_id},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[CanUpdateCaseStatus])
    def update_status(self, request, pk=None):
        """
        Update the status of a case.
        Writes to CaseHistory per business rules.
        Only the assigned legal officer can update status.
        """
        case = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_statuses = [choice[0] for choice in Case.StatusChoices.choices]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid statuses are: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_status = case.status
        case.status = new_status
        case.save()

        # Write to CaseHistory
        CaseHistory.objects.create(
            case=case,
            user=request.user,
            action='Status Updated',
            description=f"Status changed from {previous_status} to {new_status}"
        )

        # Notify Head users when a case is closed by a legal officer
        if new_status == 'closed' and request.user.role == 'legal_officer':
            head_users = User.objects.filter(role='head')
            for head in head_users:
                Notification.objects.create(
                    recipient=head,
                    message=f"Case {case.case_id}: {case.title} has been closed by {request.user.username}"
                )

        return Response(
            {'message': f'Case status updated to {new_status}', 'case_id': case.case_id},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrHead])
    def review(self, request, pk=None):
        """
        Review a pending case and accept or reject it.
        Only admin/head can review cases.
        Accept: moves status from pending_review to registered
        Reject: requires reason, moves status to rejected
        """
        case = self.get_object()
        decision = request.data.get('decision')

        if not decision:
            return Response(
                {'error': 'decision is required (accept or reject)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if decision == 'accept':
            if case.status != 'pending_review':
                return Response(
                    {'error': 'Only pending_review cases can be accepted'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            previous_status = case.status
            case.status = 'registered'
            case.save()

            # Write to CaseHistory
            CaseHistory.objects.create(
                case=case,
                user=request.user,
                action='Case Accepted',
                description=f"Case accepted by {request.user.username}. Status changed from {previous_status} to registered"
            )

            return Response(
                {'message': 'Case accepted and moved to registered status', 'case_id': case.case_id},
                status=status.HTTP_200_OK
            )

        elif decision == 'reject':
            reason = request.data.get('reason')
            
            if not reason:
                return Response(
                    {'error': 'reason is required when rejecting a case'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if case.status != 'pending_review':
                return Response(
                    {'error': 'Only pending_review cases can be rejected'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            previous_status = case.status
            case.status = 'rejected'
            case.rejection_reason = reason
            case.save()

            # Write to CaseHistory
            CaseHistory.objects.create(
                case=case,
                user=request.user,
                action='Case Rejected',
                description=f"Case rejected by {request.user.username}. Reason: {reason}"
            )

            return Response(
                {'message': 'Case rejected', 'case_id': case.case_id},
                status=status.HTTP_200_OK
            )

        else:
            return Response(
                {'error': 'Invalid decision. Must be "accept" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get case history entries for this case.
        """
        case = self.get_object()
        history = CaseHistory.objects.filter(case=case).select_related('user').order_by('-timestamp')
        serializer = CaseHistorySerializer(history, many=True)
        return Response(serializer.data)
