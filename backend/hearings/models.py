from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Hearing(models.Model):
    """
    Hearing model for court/legal proceedings related to cases.
    FR-20: tracks hearing dates and locations for case management.
    """
    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='hearings')
    hearing_date = models.DateTimeField()
    location = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_hearings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['hearing_date']
        verbose_name_plural = 'Hearings'

    def __str__(self):
        return f"{self.case.case_id} - {self.hearing_date.strftime('%Y-%m-%d %H:%M')}"

    def save(self, *args, **kwargs):
        # Create notification if hearing is within 48 hours
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new or self.hearing_date != Hearing.objects.get(pk=self.pk).hearing_date:
            self.check_and_notify_48_hours()

    def check_and_notify_48_hours(self):
        """Create notification if hearing is within 48 hours"""
        now = timezone.now()
        time_until_hearing = self.hearing_date - now
        
        if timedelta(hours=0) <= time_until_hearing <= timedelta(hours=48):
            if self.case.assigned_officer:
                from notifications.models import Notification
                Notification.objects.create(
                    recipient=self.case.assigned_officer,
                    message=f"Upcoming hearing for case {self.case.case_id} on {self.hearing_date.strftime('%Y-%m-%d %H:%M')} at {self.location}"
                )


class Deadline(models.Model):
    """
    Deadline model for case-related deadlines and due dates.
    FR-21: tracks deadlines for urgent case identification.
    """
    case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, related_name='deadlines')
    description = models.CharField(max_length=200)
    due_date = models.DateTimeField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']
        verbose_name_plural = 'Deadlines'

    def __str__(self):
        return f"{self.case.case_id} - {self.description} ({self.due_date.strftime('%Y-%m-%d')})"

    def save(self, *args, **kwargs):
        # Create notification if deadline is within 48 hours
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new or self.due_date != Deadline.objects.get(pk=self.pk).due_date:
            self.check_and_notify_48_hours()

    def check_and_notify_48_hours(self):
        """Create notification if deadline is within 48 hours and not resolved"""
        if self.is_resolved:
            return
            
        now = timezone.now()
        time_until_deadline = self.due_date - now
        
        if timedelta(hours=0) <= time_until_deadline <= timedelta(hours=48):
            if self.case.assigned_officer:
                from notifications.models import Notification
                Notification.objects.create(
                    recipient=self.case.assigned_officer,
                    message=f"Deadline approaching for case {self.case.case_id}: {self.description} due {self.due_date.strftime('%Y-%m-%d %H:%M')}"
                )
