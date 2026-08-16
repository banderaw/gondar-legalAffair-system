from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model for the legal system with role-based access control.
    Extends Django's AbstractUser to include legal system-specific fields.
    """
    class RoleChoices(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        HEAD = 'head', 'Head'
        LEGAL_OFFICER = 'legal_officer', 'Legal Officer'
        REPORTER = 'reporter', 'Reporter'

    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.ADMIN
    )
    campus = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
