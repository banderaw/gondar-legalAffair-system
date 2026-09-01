from django.contrib import admin
from .models import Campus, Department, CaseCategory


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'campus_name', 'created_at')
    list_filter = ('campus',)
    search_fields = ('name', 'code', 'campus__name')
    list_select_related = ('campus',)

    def campus_name(self, obj):
        return obj.campus.name
    campus_name.short_description = 'Campus'
    campus_name.admin_order_field = 'campus__name'


@admin.register(CaseCategory)
class CaseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
