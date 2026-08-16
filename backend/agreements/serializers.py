from rest_framework import serializers
from .models import ScholarshipAgreement


class ScholarshipAgreementSerializer(serializers.ModelSerializer):
    """
    Serializer for ScholarshipAgreement model.
    Business Rule: "scholarship-related information shall only be accessible to authorized users"
    FR-26: tracks scholarship sponsorship details and periods.
    """
    # FR-26: case reference (optional, for scholarship-category cases)
    case_id = serializers.IntegerField(source='case.id', read_only=True, allow_null=True)
    case_title = serializers.CharField(source='case.title', read_only=True, allow_null=True)
    # FR-26: sponsored person name/employee reference
    sponsored_person = serializers.CharField()
    # FR-26: sponsorship start date
    sponsorship_start_date = serializers.DateField()
    # FR-26: sponsorship end date
    sponsorship_end_date = serializers.DateField()
    # FR-26: total sponsorship amount
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    # FR-26: guarantee details
    guarantee_details = serializers.CharField(allow_blank=True, required=False)
    # FR-26: supporting document reference
    supporting_document_id = serializers.IntegerField(source='supporting_document.id', read_only=True, allow_null=True)
    supporting_document_title = serializers.CharField(source='supporting_document.title', read_only=True, allow_null=True)
    # FR-27: calculated sponsorship period in months
    sponsorship_duration_months = serializers.ReadOnlyField()
    # FR-28: user who created the agreement
    created_by = serializers.SerializerMethodField()
    # FR-29: creation timestamp
    created_at = serializers.DateTimeField(read_only=True)
    # FR-30: last update timestamp
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ScholarshipAgreement
        fields = ['id', 'case_id', 'case_title', 'sponsored_person', 
                  'sponsorship_start_date', 'sponsorship_end_date', 'total_amount',
                  'guarantee_details', 'supporting_document_id', 'supporting_document_title',
                  'sponsorship_duration_months', 'created_by', 'created_at', 'updated_at']

    def get_created_by(self, obj):
        """FR-28: user who created the agreement"""
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email
            }
        return None
