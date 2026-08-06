"""Role-Based Access Control (RBAC).

Defines the canonical role vocabulary and a ``role_required`` decorator that
enforces, against the authenticated Flask-Login user, that the current user
holds one of the permitted roles.
"""

from functools import wraps
from urllib.parse import urlparse

from flask import abort
from flask_babel import lazy_gettext as _l
from flask_login import current_user


def is_safe_redirect_target(target):
    """True only for same-host relative paths (prevents open redirects).

    Used for the post-login ``next`` parameter and for returning the user to
    the page they came from after switching language.
    """
    if not target:
        return False
    parsed = urlparse(target)
    return not parsed.netloc and not parsed.scheme and target.startswith("/")


class Roles:
    """Canonical role identifiers used across the system."""

    SYSTEM_ADMIN = "system_admin"
    NURSING_DIRECTOR = "nursing_director"
    DEPARTMENT_HEAD = "department_head"
    STAFF_NURSE = "staff_nurse"

    ALL = (SYSTEM_ADMIN, NURSING_DIRECTOR, DEPARTMENT_HEAD, STAFF_NURSE)

    # Display labels for dropdowns and tables. Only the label is localised —
    # the key above is what is stored on the record, so it never varies with
    # the interface language.
    LABELS = {
        SYSTEM_ADMIN: _l("مدير النظام"),
        NURSING_DIRECTOR: _l("مدير التمريض"),
        DEPARTMENT_HEAD: _l("رئيس قسم"),
        STAFF_NURSE: _l("ممرض/ممرضة"),
    }

    @classmethod
    def label(cls, role):
        """Localised label for a role value (falls back to the raw value)."""
        return cls.LABELS.get(role, role or "—")


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
