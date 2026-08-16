from rest_framework import serializers
from .models import Campus, Department, CaseCategory


class CampusSerializer(serializers.ModelSerializer):
    """
    Serializer for Campus model with read-only fields.
    """
    class Meta:
        model = Campus
        fields = ('id', 'name', 'code', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Department model with campus nested data.
    """
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model = Department
        fields = ('id', 'name', 'code', 'campus', 'campus_name', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CaseCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for CaseCategory model with read-only fields.
    """
    class Meta:
        model = CaseCategory
        fields = ('id', 'name', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
