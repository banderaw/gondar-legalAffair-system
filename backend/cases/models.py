from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from core.models import Campus, Department, CaseCategory
import datetime

User = get_user_model()


class Case(models.Model):
    """
    Main Case model for the legal system.
    FR-08: unique case identifier in LC-YYYY-NNNN format.
    Tracks legal cases with status, priority, and assignment information.
    """
    class StatusChoices(models.TextChoices):
        REGISTERED = 'registered', 'Registered'
        ACTIVE = 'active', 'Active'
        UNDER_REVIEW = 'under_review', 'Under Review'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'

    class PriorityChoices(models.TextChoices):
        LOW = 'low', 'Low'
        NORMAL = 'normal', 'Normal'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    case_id = models.CharField(max_length=20, unique=True, editable=False)
    title = models.CharField(max_length=200)
    category = models.ForeignKey(CaseCategory, on_delete=models.PROTECT, related_name='cases')
    campus = models.ForeignKey(Campus, on_delete=models.PROTECT, related_name='cases')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='cases')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.REGISTERED)
    priority = models.CharField(max_length=20, choices=PriorityChoices.choices, default=PriorityChoices.NORMAL)
    assigned_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    concerned_party = models.CharField(max_length=200)
    description = models.TextField()
    registered_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='registered_cases')
    closed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Cases'

    def __str__(self):
        return f"{self.case_id} - {self.title}"

    def clean(self):
        # FR-08: validation for case closure
        if self.status == self.StatusChoices.CLOSED and not self.closed_at:
            raise ValidationError(
                {'closed_at': 'A case cannot be marked as closed without a closed_at timestamp.'}
            )

    def save(self, *args, **kwargs):
        # FR-08: auto-generate case_id in LC-YYYY-NNNN format
        if not self.case_id:
            year = datetime.datetime.now().year
            # Get the latest case_id for this year
            latest_case = Case.objects.filter(case_id__startswith=f'LC-{year}').order_by('-case_id').first()
            if latest_case:
                # Extract the numeric part and increment
                last_number = int(latest_case.case_id.split('-')[-1])
                new_number = last_number + 1
            else:
                new_number = 1
            self.case_id = f'LC-{year}-{new_number:04d}'
        
        # Auto-set closed_at when status changes to closed
        if self.status == self.StatusChoices.CLOSED and not self.closed_at:
            self.closed_at = datetime.datetime.now()
        
        # Clear closed_at if status is not closed
        elif self.status != self.StatusChoices.CLOSED and self.closed_at:
            self.closed_at = None
        
        super().save(*args, **kwargs)


class CaseHistory(models.Model):
    """
    History model for tracking all changes to a case.
    Per Business Rules: "activities and important changes shall be recorded in case history."
    """
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='case_history')
    action = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Case History'

    def __str__(self):
        return f"{self.case.case_id} - {self.action} ({self.timestamp})"
