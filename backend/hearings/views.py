from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta
from .models import Hearing, Deadline
from .serializers import HearingSerializer, DeadlineSerializer
from cases.permissions import IsAdminOrHead, IsLegalOfficer, IsStaff
from cases.models import Case
from notifications.models import Notification

User = get_user_model()


class HearingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Hearing model with case-scoped permissions.
    Hearings are only visible to users who can view the parent case.
    """
    serializer_class = HearingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case']

    def get_queryset(self):
        """Filter hearings based on user's access to parent case"""
        user = self.request.user
        case_id = self.kwargs.get('case_id')
        
        # If case_id is provided, filter for that specific case
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return Hearing.objects.none()
            
            # Apply same permission logic as CaseViewSet
            if user.role == 'legal_officer':
                if case.assigned_officer != user:
                    return Hearing.objects.none()
            elif user.role == 'staff':
                if case.registered_by != user:
                    return Hearing.objects.none()
            
            return Hearing.objects.filter(case_id=case_id).select_related('created_by', 'case')
        
        # If no case_id, return all hearings user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:
            accessible_cases = Case.objects.all()
        
        return Hearing.objects.filter(case__in=accessible_cases).select_related('created_by', 'case')

    def get_permissions(self):
        """Apply same permission logic as CaseViewSet"""
        if self.action in ['create', 'destroy']:
            permission_classes = [IsAdminOrHead]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAdminOrHead | IsLegalOfficer]
        else:
            permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Automatically set created_by and case"""
        case_id = self.kwargs.get('case_id')
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response(
                {'error': 'Case not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        hearing = serializer.save(created_by=self.request.user, case=case)
        
        # Create notification if hearing is within 48 hours
        if hearing.hearing_date:
            now = timezone.now()
            forty_eight_hours = now + timedelta(hours=48)
            if hearing.hearing_date <= forty_eight_hours:
                recipient = case.assigned_officer or case.registered_by
                if recipient:
                    Notification.objects.create(
                        recipient=recipient,
                        message=f"Upcoming hearing for case {case.case_id}: {case.title} on {hearing.hearing_date.strftime('%Y-%m-%d %H:%M')}"
                    )


class DeadlineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Deadline model with case-scoped permissions.
    Deadlines are only visible to users who can view the parent case.
    """
    serializer_class = DeadlineSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['case', 'is_resolved']

    def get_queryset(self):
        """Filter deadlines based on user's access to parent case"""
        user = self.request.user
        case_id = self.kwargs.get('case_id')
        
        # If case_id is provided, filter for that specific case
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
            except Case.DoesNotExist:
                return Deadline.objects.none()
            
            # Apply same permission logic as CaseViewSet
            if user.role == 'legal_officer':
                if case.assigned_officer != user:
                    return Deadline.objects.none()
            elif user.role == 'staff':
                if case.registered_by != user:
                    return Deadline.objects.none()
            
            return Deadline.objects.filter(case_id=case_id).select_related('case')
        
        # If no case_id, return all deadlines user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:
            accessible_cases = Case.objects.all()
        
        return Deadline.objects.filter(case__in=accessible_cases).select_related('case')

    def get_permissions(self):
        """Apply same permission logic as CaseViewSet"""
        if self.action in ['create', 'destroy']:
            permission_classes = [IsAdminOrHead]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAdminOrHead | IsLegalOfficer]
        else:
            permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Automatically set case"""
        case_id = self.kwargs.get('case_id')
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response(
                {'error': 'Case not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        deadline = serializer.save(case=case)
        
        # Create notification if deadline is within 48 hours
        if deadline.due_date:
            now = timezone.now()
            forty_eight_hours = now + timedelta(hours=48)
            if deadline.due_date <= forty_eight_hours:
                recipient = case.assigned_officer or case.registered_by
                if recipient:
                    Notification.objects.create(
                        recipient=recipient,
                        message=f"Upcoming deadline for case {case.case_id}: {case.title} due {deadline.due_date.strftime('%Y-%m-%d %H:%M')}"
                    )

    @action(detail=True, methods=['post'])
    def mark_resolved(self, request, pk=None):
        """Mark a deadline as resolved"""
        deadline = self.get_object()
        deadline.is_resolved = True
        deadline.save()
        return Response({'message': 'Deadline marked as resolved'})


class UpcomingHearingsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for upcoming hearings across all accessible cases.
    Business Rule: "urgent cases shall be identifiable to authorized users"
    Returns hearings in the next 14 days.
    """
    serializer_class = HearingSerializer
    permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]

    def get_queryset(self):
        """Get hearings in next 14 days for cases user can access"""
        user = self.request.user
        now = timezone.now()
        fourteen_days = now + timedelta(days=14)
        
        # Get cases user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:  # admin or head
            accessible_cases = Case.objects.all()
        
        # Get upcoming hearings for accessible cases
        return Hearing.objects.filter(
            case__in=accessible_cases,
            hearing_date__range=[now, fourteen_days]
        ).select_related('created_by', 'case').order_by('hearing_date')


class UpcomingDeadlinesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for upcoming deadlines across all accessible cases.
    Business Rule: "urgent cases shall be identifiable to authorized users"
    Returns unresolved deadlines due in next 7 days or overdue.
    """
    serializer_class = DeadlineSerializer
    permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]

    def get_queryset(self):
        """Get unresolved deadlines due in next 7 days or overdue"""
        user = self.request.user
        now = timezone.now()
        seven_days = now + timedelta(days=7)
        
        # Get cases user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:  # admin or head
            accessible_cases = Case.objects.all()
        
        # Get upcoming deadlines for accessible cases
        return Deadline.objects.filter(
            case__in=accessible_cases,
            is_resolved=False,
            due_date__lte=seven_days
        ).select_related('case').order_by('due_date')
