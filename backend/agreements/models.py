from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class ScholarshipAgreement(models.Model):
    """
    Scholarship agreement model for scholarship-related cases.
    Business Rule: "scholarship-related information shall only be accessible to authorized users"
    FR-26: tracks scholarship sponsorship details and periods.
    """
    case = models.OneToOneField('cases.Case', on_delete=models.CASCADE, related_name='scholarship_agreement', null=True, blank=True)
    sponsored_person = models.CharField(max_length=200, help_text="Name or employee reference of sponsored person")
    sponsorship_start_date = models.DateField()
    sponsorship_end_date = models.DateField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    guarantee_details = models.TextField(blank=True)
    supporting_document = models.ForeignKey('documents.CaseDocument', on_delete=models.SET_NULL, null=True, blank=True, related_name='scholarship_agreements')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_scholarship_agreements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Scholarship Agreements'

    def __str__(self):
        return f"Scholarship Agreement - {self.sponsored_person}"

    @property
    def sponsorship_duration_months(self):
        """
        FR-27: calculated sponsorship period in months.
        Helps calculate sponsorship periods as per requirements.
        """
        if self.sponsorship_start_date and self.sponsorship_end_date:
            months = (self.sponsorship_end_date.year - self.sponsorship_start_date.year) * 12
            months += self.sponsorship_end_date.month - self.sponsorship_start_date.month
            return max(0, months)
        return 0
