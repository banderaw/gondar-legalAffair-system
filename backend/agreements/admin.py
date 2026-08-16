from django.contrib import admin
from .models import ScholarshipAgreement


@admin.register(ScholarshipAgreement)
class ScholarshipAgreementAdmin(admin.ModelAdmin):
    list_display = ('sponsored_person', 'case', 'sponsorship_start_date', 'sponsorship_end_date', 'total_amount', 'created_by', 'created_at')
    list_filter = ('sponsorship_start_date', 'sponsorship_end_date', 'created_at')
    search_fields = ('sponsored_person', 'case__case_id')
    readonly_fields = ('created_at', 'updated_at', 'sponsorship_duration_months')
