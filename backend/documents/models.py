from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import os
from datetime import datetime

User = get_user_model()


def validate_file_size(file):
    """Validate file size is <= 10MB"""
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(f'File size cannot exceed 10MB. Current size: {file.size / (1024 * 1024):.2f}MB')


def validate_file_type(file):
    """Validate file type is PDF/DOCX/JPG/PNG"""
    allowed_extensions = ['.pdf', '.docx', '.jpg', '.jpeg', '.png']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f'File type not allowed. Allowed types: {", ".join(allowed_extensions)}')


def document_upload_path(instance, filename):
    """Generate upload path: media/case_documents/%Y/%m/"""
    ext = os.path.splitext(filename)[1]
    timestamp = datetime.now()
    return f'case_documents/{timestamp.year}/{timestamp.month}/{instance.case.case_id}_{instance.id}{ext}'


class CaseDocument(models.Model):
    """
    Document model for case-related file uploads.
    Files are stored locally under media/case_documents/%Y/%m/
    TODO: Move to S3-compatible storage for production.
    """
    SOURCE_CHOICES = [
        ('initial_submission', 'Initial Submission'),
        ('internal', 'Internal'),
    ]
    
    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(
        upload_to=document_upload_path,
        validators=[validate_file_size, validate_file_type]
    )
    title = models.CharField(max_length=200)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_confidential = models.BooleanField(default=False)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='internal')

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = 'Case Documents'

    def __str__(self):
        return f"{self.case.case_id} - {self.title}"
