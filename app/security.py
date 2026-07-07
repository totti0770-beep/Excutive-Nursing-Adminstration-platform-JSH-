"""Role-Based Access Control (RBAC).

Defines the canonical role vocabulary and a ``role_required`` decorator that
enforces, against the authenticated Flask-Login user, that the current user
holds one of the permitted roles.
"""
from functools import wraps

from flask import abort
from flask_login import current_user


class Roles:
    """Canonical role identifiers used across the system."""

    SYSTEM_ADMIN = "system_admin"
    NURSING_DIRECTOR = "nursing_director"
    DEPARTMENT_HEAD = "department_head"
    STAFF_NURSE = "staff_nurse"

    ALL = (SYSTEM_ADMIN, NURSING_DIRECTOR, DEPARTMENT_HEAD, STAFF_NURSE)

    # Arabic display labels for UI dropdowns and tables.
    LABELS_AR = {
        SYSTEM_ADMIN: "مدير النظام",
        NURSING_DIRECTOR: "مدير التمريض",
        DEPARTMENT_HEAD: "رئيس قسم",
        STAFF_NURSE: "ممرض/ممرضة",
    }

    @classmethod
    def label(cls, role):
        """Arabic label for a role value (falls back to the raw value)."""
        return cls.LABELS_AR.get(role, role or "—")


def role_required(*roles):
    """Restrict a view to users holding one of the given roles.

    Unauthenticated users get 401 (Flask-Login's unauthorized handler will
    redirect them to the login page); authenticated users lacking a permitted
    role get 403.
    """

    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)
            if roles and current_user.role not in roles:
                abort(403)
            return view(*args, **kwargs)

        wrapped.required_roles = roles
        return wrapped

    return decorator
