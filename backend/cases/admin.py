from django.contrib import admin
from .models import Case, CaseHistory


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'title', 'category', 'campus', 'status', 'priority', 'assigned_officer', 'created_at')
    list_filter = ('status', 'priority', 'category', 'campus', 'created_at')
    search_fields = ('case_id', 'title', 'concerned_party')
    readonly_fields = ('case_id', 'closed_at', 'created_at', 'updated_at')
    fieldsets = (
        ('Case Information', {
            'fields': ('case_id', 'title', 'category', 'campus', 'department')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'assigned_officer')
        }),
        ('Details', {
            'fields': ('concerned_party', 'description', 'registered_by')
        }),
        ('Timestamps', {
            'fields': ('closed_at', 'created_at', 'updated_at')
        }),
    )


@admin.register(CaseHistory)
class CaseHistoryAdmin(admin.ModelAdmin):
    list_display = ('case', 'user', 'action', 'timestamp')
    list_filter = ('timestamp', 'action')
    search_fields = ('case__case_id', 'action', 'user__username')
    readonly_fields = ('timestamp',)
