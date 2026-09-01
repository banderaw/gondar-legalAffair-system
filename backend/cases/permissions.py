from rest_framework import permissions


class IsAdminOrHead(permissions.BasePermission):
    """
    Permission class for admin and head roles.
    Admin and head can do anything with cases.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'head']


class IsLegalOfficer(permissions.BasePermission):
    """
    Permission class for legal_officer role.
    Legal officer can view/update only cases assigned to them.
    Cannot delete cases.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'legal_officer'

    def has_object_permission(self, request, view, obj):
        # Legal officers can only view/update their assigned cases
        if request.method in permissions.SAFE_METHODS:
            return obj.assigned_officer == request.user
        # Legal officers can update their assigned cases (PUT, PATCH, POST for custom actions)
        elif request.method in ['PUT', 'PATCH', 'POST']:
            return obj.assigned_officer == request.user
        # Legal officers cannot delete
        return False


class CanAssignCase(permissions.BasePermission):
    """
    Permission class for case assignment.
    Business Rule: "Only authorized users shall be permitted to assign cases"
    Only admin and head may assign or reassign a case to an officer.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'head']

    def has_object_permission(self, request, view, obj):
        # Only admin/head can modify assigned_officer field
        if 'assigned_officer' in request.data:
            return request.user.role in ['admin', 'head']
        return True


class IsReporter(permissions.BasePermission):
    """
    Permission class for reporter role.
    Reporters can create cases and view only cases they registered.
    Cannot update, delete, assign, or access other features.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'reporter'

    def has_object_permission(self, request, view, obj):
        # Reporters can only view cases they registered
        return request.method in permissions.SAFE_METHODS and obj.registered_by == request.user


class CanUpdateCaseStatus(permissions.BasePermission):
    """
    Permission class for case status updates.
    Only the legal officer assigned to the case can update its status.
    Admin and head cannot update status directly.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'legal_officer'

    def has_object_permission(self, request, view, obj):
        # Only the assigned legal officer can update status
        return obj.assigned_officer_id == request.user.id
