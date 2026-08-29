from rest_framework import serializers
from .models import Hearing, Deadline


class HearingSerializer(serializers.ModelSerializer):
    """
    Serializer for Hearing model.
    FR-20: tracks hearing dates and locations for case management.
    """
    # FR-20: case reference for hearing association
    case = serializers.IntegerField(write_only=True, required=False)
    case_id = serializers.IntegerField(source='case.id', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    # FR-20: hearing date and time
    hearing_date = serializers.DateTimeField()
    # FR-20: hearing location
    location = serializers.CharField()
    # FR-20: additional notes for hearing
    notes = serializers.CharField(allow_blank=True, required=False)
    # FR-22: user who created the hearing
    created_by = serializers.SerializerMethodField()
    # FR-23: creation timestamp
    created_at = serializers.DateTimeField(read_only=True)
    # FR-24: last update timestamp
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Hearing
        fields = ['id', 'case', 'case_id', 'case_title', 'hearing_date', 'location', 
                  'notes', 'created_by', 'created_at', 'updated_at']

    def get_created_by(self, obj):
        """FR-22: user who created the hearing"""
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None


class DeadlineSerializer(serializers.ModelSerializer):
    """
    Serializer for Deadline model.
    FR-21: tracks deadlines for urgent case identification.
    """
    # FR-21: case reference for deadline association
    case = serializers.IntegerField(write_only=True, required=False)
    case_id = serializers.IntegerField(source='case.id', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    # FR-21: deadline description
    description = serializers.CharField()
    # FR-21: due date and time
    due_date = serializers.DateTimeField()
    # FR-25: resolution status
    is_resolved = serializers.BooleanField(required=False, default=False)
    # FR-23: creation timestamp
    created_at = serializers.DateTimeField(read_only=True)
    # FR-24: last update timestamp
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Deadline
        fields = ['id', 'case', 'case_id', 'case_title', 'description', 'due_date', 
                  'is_resolved', 'created_at', 'updated_at']
