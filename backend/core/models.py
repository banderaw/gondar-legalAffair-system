from django.db import models


class Campus(models.Model):
    """
    Campus model for different university/organization campuses.
    Core reference data used across the legal system.
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Campuses'

    def __str__(self):
        return self.name


class Department(models.Model):
    """
    Department model for different organizational departments.
    Linked to campuses and used across the legal system.
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE, related_name='departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campus.name} - {self.name}"


class CaseCategory(models.Model):
    """
    Category model for classifying legal cases.
    Core reference data used across the legal system.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Case Categories'

    def __str__(self):
        return self.name
