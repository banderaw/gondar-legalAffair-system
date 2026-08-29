from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q, Subquery, OuterRef, Max, Case as CaseExpression, When, Value, IntegerField, Avg, F, ExpressionWrapper, DurationField
from django.db.models.functions import Extract
from cases.models import Case, CaseHistory
from hearings.models import Hearing, Deadline
from cases.permissions import IsAdminOrHead, IsLegalOfficer, IsStaff, IsReporter
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()


class DashboardSummaryView(APIView):
    """
    Read-only endpoint for dashboard summary statistics.
    Returns aggregated counts for cases, hearings, and deadlines.
    """
    permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]

    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Get cases user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:  # admin or head
            accessible_cases = Case.objects.all()
        
        # Total cases
        total_cases = accessible_cases.count()
        
        # Counts by status
        status_counts = accessible_cases.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        status_counts_dict = {item['status']: item['count'] for item in status_counts}
        
        # Counts by priority
        priority_counts = accessible_cases.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        priority_counts_dict = {item['priority']: item['count'] for item in priority_counts}
        
        # Counts by campus
        campus_counts = accessible_cases.values('campus__name').annotate(
            count=Count('id')
        ).order_by('campus__name')
        campus_counts_dict = {item['campus__name']: item['count'] for item in campus_counts}
        
        # Counts by category
        category_counts = accessible_cases.values('category__name').annotate(
            count=Count('id')
        ).order_by('category__name')
        category_counts_dict = {item['category__name']: item['count'] for item in category_counts}
        
        # Upcoming hearings count (next 14 days)
        fourteen_days = now + timedelta(days=14)
        upcoming_hearings = Hearing.objects.filter(
            case__in=accessible_cases,
            hearing_date__range=[now, fourteen_days]
        ).count()
        
        # Overdue deadlines count
        overdue_deadlines = Deadline.objects.filter(
            case__in=accessible_cases,
            is_resolved=False,
            due_date__lt=now
        ).count()
        
        # Personal assigned case counts for legal officers
        personal_counts = None
        if user.role == 'legal_officer':
            personal_counts = {
                'total_assigned': accessible_cases.count(),
                'by_status': accessible_cases.values('status').annotate(
                    count=Count('id')
                ).order_by('status'),
                'by_priority': accessible_cases.values('priority').annotate(
                    count=Count('id')
                ).order_by('priority'),
            }
        
        return Response({
            'total_cases': total_cases,
            'status_counts': status_counts_dict,
            'priority_counts': priority_counts_dict,
            'campus_counts': campus_counts_dict,
            'category_counts': category_counts_dict,
            'upcoming_hearings_count': upcoming_hearings,
            'overdue_deadlines_count': overdue_deadlines,
            'personal_counts': personal_counts,
        })


class AdminDashboardView(APIView):
    """
    Admin-specific dashboard endpoint with system oversight data.
    Only accessible to users with admin role.
    """
    permission_classes = [IsAdminOrHead]

    def get(self, request):
        now = timezone.now()
        ten_days_ago = now - timedelta(days=10)
        
        # Total users and users by role
        total_users = User.objects.count()
        users_by_role = User.objects.values('role').annotate(
            count=Count('id')
        ).order_by('role')
        users_by_role_dict = {item['role']: item['count'] for item in users_by_role}
        
        # Officer workload - open cases per legal officer
        officers = User.objects.filter(role='legal_officer')
        officer_workload = []
        for officer in officers:
            open_cases = Case.objects.filter(
                assigned_officer=officer,
                status__in=['registered', 'active', 'under_review', 'in_progress']
            ).count()
            officer_workload.append({
                'officer_id': officer.id,
                'officer_name': f"{officer.first_name} {officer.last_name}",
                'open_cases': open_cases
            })
        
        # Stale cases - registered status for more than 10 days
        stale_cases = Case.objects.filter(
            status='registered',
            created_at__lt=ten_days_ago
        ).values('id', 'case_id', 'title', 'created_at')
        stale_cases_count = stale_cases.count()
        stale_cases_list = list(stale_cases)
        
        # Unassigned urgent cases
        unassigned_urgent = Case.objects.filter(
            priority='urgent',
            assigned_officer__isnull=True,
            status='registered'
        ).values('id', 'case_id', 'title', 'created_at')
        unassigned_urgent_count = unassigned_urgent.count()
        unassigned_urgent_list = list(unassigned_urgent)
        
        # Pending review cases - for review panel
        pending_review_cases = Case.objects.filter(
            status='pending_review'
        ).select_related('category', 'campus').values(
            'id', 'case_id', 'title', 'priority', 'category__name', 'campus__name', 'created_at'
        ).order_by('-created_at')
        
        # Recent activity - last 10 CaseHistory entries
        recent_activity = CaseHistory.objects.select_related(
            'case', 'user'
        ).order_by('-timestamp')[:10].values(
            'case__case_id',
            'case__title',
            'action',
            'user__username',
            'user__first_name',
            'user__last_name',
            'timestamp'
        )
        
        # Standard case counts for admin
        total_cases = Case.objects.count()
        
        status_counts = Case.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        status_counts_dict = {item['status']: item['count'] for item in status_counts}
        
        priority_counts = Case.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        priority_counts_dict = {item['priority']: item['count'] for item in priority_counts}
        
        campus_counts = Case.objects.values('campus__name').annotate(
            count=Count('id')
        ).order_by('campus__name')
        campus_counts_dict = {item['campus__name']: item['count'] for item in campus_counts}
        
        # Upcoming hearings count (next 14 days)
        fourteen_days = now + timedelta(days=14)
        upcoming_hearings = Hearing.objects.filter(
            hearing_date__range=[now, fourteen_days]
        ).count()
        
        # Overdue deadlines count
        overdue_deadlines = Deadline.objects.filter(
            is_resolved=False,
            due_date__lt=now
        ).count()
        
        return Response({
            'total_cases': total_cases,
            'total_users': total_users,
            'users_by_role': users_by_role_dict,
            'officer_workload': officer_workload,
            'stale_cases_count': stale_cases_count,
            'stale_cases': stale_cases_list,
            'unassigned_urgent_count': unassigned_urgent_count,
            'unassigned_urgent': unassigned_urgent_list,
            'pending_review_cases': list(pending_review_cases),
            'recent_activity': list(recent_activity),
            'status_counts': status_counts_dict,
            'priority_counts': priority_counts_dict,
            'campus_counts': campus_counts_dict,
            'upcoming_hearings_count': upcoming_hearings,
            'overdue_deadlines_count': overdue_deadlines,
        })


class HeadDashboardView(APIView):
    """
    Head-specific dashboard endpoint with case flow and officer performance data.
    Accessible to users with head or admin role.
    """
    permission_classes = [IsAdminOrHead]

    def get(self, request):
        now = timezone.now()
        fourteen_days = now + timedelta(days=14)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Officer workload with closed_this_month
        officers = User.objects.filter(role='legal_officer')
        officer_workload = []
        for officer in officers:
            open_cases = Case.objects.filter(
                assigned_officer=officer,
                status__in=['registered', 'active', 'under_review', 'in_progress']
            ).count()
            closed_this_month = Case.objects.filter(
                assigned_officer=officer,
                status='closed',
                closed_at__gte=start_of_month
            ).count()
            officer_workload.append({
                'officer_id': officer.id,
                'officer_name': f"{officer.first_name} {officer.last_name}",
                'open_cases': open_cases,
                'closed_this_month': closed_this_month
            })
        
        # Unassigned cases - ordered by priority then created_at
        # Only include registered status cases (not pending_review)
        priority_order = {'urgent': 0, 'high': 1, 'normal': 2, 'low': 3}
        unassigned_cases = Case.objects.filter(
            assigned_officer__isnull=True,
            status='registered'
        ).annotate(
            priority_order=CaseExpression(
                When(priority='urgent', then=Value(0)),
                When(priority='high', then=Value(1)),
                When(priority='normal', then=Value(2)),
                When(priority='low', then=Value(3)),
                default=Value(4),
                output_field=IntegerField()
            )
        ).order_by('priority_order', 'created_at').values(
            'id', 'case_id', 'title', 'priority', 'category__name', 'campus__name', 'created_at'
        )
        
        # Pending review cases - for review panel
        pending_review_cases = Case.objects.filter(
            status='pending_review'
        ).select_related('category', 'campus').values(
            'id', 'case_id', 'title', 'priority', 'category__name', 'campus__name', 'created_at'
        ).order_by('-created_at')
        
        # Overdue deadlines - full list
        overdue_deadlines = Deadline.objects.filter(
            is_resolved=False,
            due_date__lt=now
        ).select_related('case').values(
            'case__id',
            'case__case_id',
            'case__title',
            'description',
            'due_date'
        ).order_by('due_date')
        
        # Upcoming hearings - next 14 days, full list
        upcoming_hearings = Hearing.objects.filter(
            hearing_date__range=[now, fourteen_days]
        ).select_related('case').values(
            'case__id',
            'case__case_id',
            'case__title',
            'hearing_date',
            'location'
        ).order_by('hearing_date')
        
        # Cases by status
        status_counts = Case.objects.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        status_counts_dict = {item['status']: item['count'] for item in status_counts}
        
        # Cases by priority
        priority_counts = Case.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        priority_counts_dict = {item['priority']: item['count'] for item in priority_counts}
        
        return Response({
            'unassigned_cases': list(unassigned_cases),
            'pending_review_cases': list(pending_review_cases),
            'officer_workload': officer_workload,
            'overdue_deadlines': list(overdue_deadlines),
            'upcoming_hearings': list(upcoming_hearings),
            'status_counts': status_counts_dict,
            'priority_counts': priority_counts_dict,
        })


class CaseReportsView(APIView):
    """
    Read-only endpoint for case reports with aggregation.
    Accepts same filters as case list and returns aggregated counts
    grouped by the group_by query parameter.
    """
    permission_classes = [IsAdminOrHead | IsLegalOfficer | IsStaff]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'category', 'campus', 'department', 'assigned_officer']

    def get(self, request):
        user = request.user
        group_by = request.query_params.get('group_by')
        
        # Validate group_by parameter
        valid_group_by = ['status', 'campus', 'department', 'category']
        if not group_by or group_by not in valid_group_by:
            return Response(
                {'error': f'group_by parameter is required and must be one of: {valid_group_by}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get cases user can access
        if user.role == 'legal_officer':
            accessible_cases = Case.objects.filter(assigned_officer=user)
        elif user.role == 'staff':
            accessible_cases = Case.objects.filter(registered_by=user)
        else:  # admin or head
            accessible_cases = Case.objects.all()
        
        # Apply filters
        queryset = accessible_cases
        
        # Apply same filters as case list
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        
        category_filter = request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category_id=category_filter)
        
        campus_filter = request.query_params.get('campus')
        if campus_filter:
            queryset = queryset.filter(campus_id=campus_filter)
        
        department_filter = request.query_params.get('department')
        if department_filter:
            queryset = queryset.filter(department_id=department_filter)
        
        assigned_officer_filter = request.query_params.get('assigned_officer')
        if assigned_officer_filter:
            queryset = queryset.filter(assigned_officer_id=assigned_officer_filter)
        
        # Group by the specified field
        if group_by == 'status':
            group_field = 'status'
            label_field = 'status'
        elif group_by == 'campus':
            group_field = 'campus__name'
            label_field = 'campus'
        elif group_by == 'department':
            group_field = 'department__name'
            label_field = 'department'
        elif group_by == 'category':
            group_field = 'category__name'
            label_field = 'category'
        
        # Get aggregated counts
        aggregated_data = queryset.values(group_field).annotate(
            count=Count('id')
        ).order_by(group_field)
        
        # Format response
        results = []
        for item in aggregated_data:
            results.append({
                'group': item[group_field],
                'count': item['count']
            })
        
        return Response({
            'group_by': group_by,
            'total': queryset.count(),
            'results': results,
        })


class OfficerDashboardView(APIView):
    """
    Legal officer-specific dashboard endpoint with personal work queue.
    Accessible only to legal_officer role, scoped to request.user.
    """
    permission_classes = [IsLegalOfficer]

    def get(self, request):
        user = request.user
        now = timezone.now()
        fourteen_days = now + timedelta(days=14)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        tomorrow = now + timedelta(days=1)
        
        # My open cases
        my_open_cases = Case.objects.filter(
            assigned_officer=user,
            status__in=['registered', 'active', 'under_review', 'in_progress']
        ).select_related('category', 'campus').values(
            'id', 'case_id', 'title', 'status', 'priority', 'category__name', 'campus__name', 'created_at'
        ).order_by('-created_at')
        
        # My urgent cases
        my_urgent_cases = my_open_cases.filter(
            priority__in=['urgent', 'high']
        )
        
        # My upcoming hearings (next 14 days)
        my_upcoming_hearings = Hearing.objects.filter(
            case__assigned_officer=user,
            hearing_date__range=[now, fourteen_days]
        ).select_related('case').values(
            'id', 'hearing_date', 'location', 'case__id', 'case__case_id', 'case__title'
        ).order_by('hearing_date')
        
        # My deadlines (unresolved, sorted by due date)
        my_deadlines = Deadline.objects.filter(
            case__assigned_officer=user,
            is_resolved=False
        ).select_related('case').values(
            'id', 'due_date', 'description', 'case__id', 'case__case_id', 'case__title'
        ).order_by('due_date')
        
        # Flag overdue deadlines
        for deadline in my_deadlines:
            deadline['is_overdue'] = deadline['due_date'] < now
        
        # Recently closed cases (last 5)
        recently_closed = Case.objects.filter(
            assigned_officer=user,
            status='closed',
            closed_at__gte=start_of_month
        ).select_related('category', 'campus').values(
            'id', 'case_id', 'title', 'closed_at'
        ).order_by('-closed_at')[:5]
        
        # Stats
        total_open = my_open_cases.count()
        total_closed_this_month = Case.objects.filter(
            assigned_officer=user,
            status='closed',
            closed_at__gte=start_of_month
        ).count()
        
        return Response({
            'my_open_cases': list(my_open_cases),
            'my_urgent_cases': list(my_urgent_cases),
            'my_upcoming_hearings': list(my_upcoming_hearings),
            'my_deadlines': list(my_deadlines),
            'recently_closed': list(recently_closed),
            'stats': {
                'total_open': total_open,
                'total_closed_this_month': total_closed_this_month
            }
        })


class ReporterDashboardView(APIView):
    """
    Reporter-specific dashboard endpoint.
    Accessible only to reporter role, scoped to request.user.
    """
    permission_classes = [IsReporter]

    def get(self, request):
        user = request.user
        
        # My submitted cases
        my_cases = Case.objects.filter(
            registered_by=user
        ).select_related('category', 'campus').values(
            'id', 'case_id', 'title', 'status', 'priority', 'created_at', 'rejection_reason'
        ).order_by('-created_at')
        
        # Status counts
        status_counts = my_cases.values('status').annotate(
            count=Count('id')
        )
        
        # Total submitted
        total_submitted = my_cases.count()
        
        # 3 most recent submissions with document counts
        from documents.models import CaseDocument
        recent_submissions = []
        for case in my_cases[:3]:
            # Count documents uploaded by this reporter for this case
            document_count = CaseDocument.objects.filter(
                case_id=case['id'],
                uploaded_by=user
            ).count()
            
            case_data = dict(case)
            case_data['document_count'] = document_count
            recent_submissions.append(case_data)
        
        return Response({
            'total_submitted': total_submitted,
            'status_counts': list(status_counts),
            'recent_submissions': recent_submissions
        })
