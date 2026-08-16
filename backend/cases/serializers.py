from rest_framework import serializers
from .models import Case, CaseHistory
from core.models import Campus, Department, CaseCategory
from core.serializers import CampusSerializer, DepartmentSerializer, CaseCategorySerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CaseListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for case list views.
    Contains essential fields for display in lists and dashboards.
    """
    # FR-08: unique case identifier for tracking
    case_id = serializers.CharField(read_only=True)
    # FR-01: case title for identification
    title = serializers.CharField()
    # FR-02: case category for classification
    category_name = serializers.CharField(source='category.name', read_only=True)
    # FR-03: campus location for organizational context
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    # FR-04: current status of the case
    status = serializers.CharField()
    # FR-05: priority level for case management
    priority = serializers.CharField()
    # FR-06: assigned officer for case responsibility
    assigned_officer_name = serializers.CharField(source='assigned_officer.username', read_only=True, allow_null=True)
    # FR-07: concerned party details
    concerned_party = serializers.CharField()
    # FR-09: registration timestamp for tracking
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'case_id', 'title', 'category_name', 'campus_name', 
                  'status', 'priority', 'assigned_officer_name', 'concerned_party', 'created_at']


class CaseDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for case detail views.
    Contains all fields with nested relationships for complete case information.
    """
    # FR-08: unique case identifier for tracking
    case_id = serializers.CharField(read_only=True)
    # FR-01: case title for identification
    title = serializers.CharField()
    # FR-02: case category with full details
    category = CaseCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    # FR-03: campus with full details
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.IntegerField(write_only=True)
    # FR-04: department with full details (optional)
    department = DepartmentSerializer(read_only=True, allow_null=True)
    department_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # FR-04: current status of the case
    status = serializers.CharField()
    # FR-05: priority level for case management
    priority = serializers.CharField()
    # Business Rule: Only authorized users can assign cases
    assigned_officer = serializers.SerializerMethodField()
    assigned_officer_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # FR-07: concerned party details
    concerned_party = serializers.CharField()
    # FR-10: case description for context
    description = serializers.CharField()
    # FR-11: user who registered the case
    registered_by = serializers.SerializerMethodField()
    # FR-12: closure timestamp for closed cases
    closed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    # FR-09: registration timestamp
    created_at = serializers.DateTimeField(read_only=True)
    # FR-13: last update timestamp
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'case_id', 'title', 'category', 'category_id', 
                  'campus', 'campus_id', 'department', 'department_id',
                  'status', 'priority', 'assigned_officer', 'assigned_officer_id',
                  'concerned_party', 'description', 'registered_by', 
                  'closed_at', 'created_at', 'updated_at']

    def get_assigned_officer(self, obj):
        """Business Rule: Only show assigned officer details to authorized users"""
        if obj.assigned_officer:
            return {
                'id': obj.assigned_officer.id,
                'username': obj.assigned_officer.username,
                'email': obj.assigned_officer.email
            }
        return None

    def get_registered_by(self, obj):
        """FR-11: user who registered the case"""
        return {
            'id': obj.registered_by.id,
            'username': obj.registered_by.username,
            'email': obj.registered_by.email
        }

    def validate_assigned_officer_id(self, value):
        """Business Rule: Only admin/head can assign cases"""
        request = self.context.get('request')
        if value and request and request.user.role not in ['admin', 'head']:
            raise serializers.ValidationError(
                "Only admin and head users can assign cases to officers."
            )
        return value


class CaseHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for case history tracking.
    Business Rule: "activities and important changes shall be recorded in case history"
    """
    # Reference to the case being tracked
    case_id = serializers.CharField(source='case.case_id', read_only=True)
    # Business Rule: user who made the change
    user = serializers.SerializerMethodField()
    # Business Rule: action description
    action = serializers.CharField()
    # Business Rule: detailed description of the change
    description = serializers.CharField(allow_blank=True)
    # Business Rule: timestamp of the action
    timestamp = serializers.DateTimeField(read_only=True)

    class Meta:
        model = CaseHistory
        fields = ['id', 'case_id', 'user', 'action', 'description', 'timestamp']

    def get_user(self, obj):
        """Business Rule: user who performed the action"""
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'role': obj.user.role
            }
        return None
