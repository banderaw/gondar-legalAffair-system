from django.urls import path
from .views import DashboardSummaryView, CaseReportsView, AdminDashboardView, HeadDashboardView, OfficerDashboardView, ReporterDashboardView

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('dashboard/head/', HeadDashboardView.as_view(), name='head-dashboard'),
    path('dashboard/officer/', OfficerDashboardView.as_view(), name='officer-dashboard'),
    path('dashboard/reporter/', ReporterDashboardView.as_view(), name='reporter-dashboard'),
    path('reports/cases/', CaseReportsView.as_view(), name='case-reports'),
]
