from rest_framework import serializers
from .models import CaseDocument


class CaseDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for CaseDocument model.
    Documents are scoped to parent case permissions.
    """
    # FR-14: case reference for document association
    case_id = serializers.IntegerField(source='case.id', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    # FR-15: document file upload
    file = serializers.FileField()
    file_url = serializers.SerializerMethodField()
    # FR-16: document title for identification
    title = serializers.CharField()
    # FR-17: user who uploaded the document
    uploaded_by = serializers.SerializerMethodField()
    # FR-18: upload timestamp
    uploaded_at = serializers.DateTimeField(read_only=True)
    # FR-19: confidentiality flag for sensitive documents
    is_confidential = serializers.BooleanField()

    class Meta:
        model = CaseDocument
        fields = ['id', 'case_id', 'case_title', 'file', 'file_url', 'title', 
                  'uploaded_by', 'uploaded_at', 'is_confidential']

    def get_file_url(self, obj):
        """Generate absolute URL for file download"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_uploaded_by(self, obj):
        """FR-17: user who uploaded the document"""
        if obj.uploaded_by:
            return {
                'id': obj.uploaded_by.id,
                'username': obj.uploaded_by.username,
                'email': obj.uploaded_by.email
            }
        return None
