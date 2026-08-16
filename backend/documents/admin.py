from django.contrib import admin
from .models import CaseDocument


@admin.register(CaseDocument)
class CaseDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'case', 'uploaded_by', 'uploaded_at', 'is_confidential')
    list_filter = ('is_confidential', 'uploaded_at')
    search_fields = ('title', 'case__case_id')
    readonly_fields = ('uploaded_at',)
