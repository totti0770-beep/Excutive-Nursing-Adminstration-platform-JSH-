"""Role-Based Access Control (RBAC).

Defines the canonical role vocabulary and a ``role_required`` decorator that
enforces, against the authenticated Flask-Login user, that the current user
holds one of the permitted roles.
"""

import re
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


#: Shortest password accepted anywhere in the system.
MIN_PASSWORD_LEN = 8


def validate_password_strength(password, email=None):
    """Return a list of reasons the password is unacceptable (empty == fine).

    Single source of truth for the policy, so the rule cannot drift between the
    self-service change form, admin user management, and the create-admin CLI.
    Returns messages rather than raising, because every caller surfaces them as
    WTForms field errors or CLI output.

    Deliberately *not* implemented: rotation and reuse history, which would need
    a password-history table. `24_Security_Architecture.md` says so explicitly
    rather than implying the policy is stronger than it is.
    """
    errors = []
    password = password or ""

    if len(password) < MIN_PASSWORD_LEN:
        errors.append(
            _l("كلمة المرور يجب أن تكون %(n)d أحرف على الأقل", n=MIN_PASSWORD_LEN)
        )

    classes = sum(
        bool(pattern.search(password))
        for pattern in (
            re.compile(r"[a-z]"),
            re.compile(r"[A-Z]"),
            re.compile(r"[0-9]"),
            re.compile(r"[^A-Za-z0-9]"),
        )
    )
    if classes < 3:
        errors.append(
            _l(
                "كلمة المرور يجب أن تجمع ثلاثة على الأقل من: أحرف صغيرة، "
                "أحرف كبيرة، أرقام، رموز."
            )
        )

    # A password built from the address it protects is guessable from the
    # username alone, which is public inside the hospital.
    if email:
        local_part = email.split("@")[0].strip().lower()
        if len(local_part) >= 3 and local_part in password.lower():
            errors.append(_l("كلمة المرور يجب ألا تحتوي على البريد الإلكتروني."))

    return errors


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
