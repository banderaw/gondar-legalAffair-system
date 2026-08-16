from django.contrib import admin
from .models import Hearing, Deadline


@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ('case', 'hearing_date', 'location', 'created_by', 'created_at')
    list_filter = ('hearing_date', 'created_at')
    search_fields = ('case__case_id', 'location')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Deadline)
class DeadlineAdmin(admin.ModelAdmin):
    list_display = ('case', 'description', 'due_date', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'due_date', 'created_at')
    search_fields = ('case__case_id', 'description')
    readonly_fields = ('created_at', 'updated_at')
