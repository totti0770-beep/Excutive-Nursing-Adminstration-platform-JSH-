"""Role-Based Access Control (RBAC) scaffolding.

This is a *placeholder* for the foundation increment. It defines the canonical
role vocabulary and a ``role_required`` decorator so that route handlers can be
annotated with their intended access level today. Real enforcement (identifying
the current user from an authenticated session) arrives with the authentication
increment (Flask-Login); until then the decorator is intentionally permissive
and simply records the required role on the view.
"""
from functools import wraps


class Roles:
    """Canonical role identifiers used across the system."""

    SYSTEM_ADMIN = "system_admin"
    NURSING_DIRECTOR = "nursing_director"
    DEPARTMENT_HEAD = "department_head"
    STAFF_NURSE = "staff_nurse"

    ALL = (SYSTEM_ADMIN, NURSING_DIRECTOR, DEPARTMENT_HEAD, STAFF_NURSE)


def role_required(*roles):
    """Annotate a view with the roles permitted to access it.

    Placeholder behaviour: attaches the required roles to the view function
    (so they are documented and testable) and passes through. The
    authentication increment will replace the body with a real check against
    the logged-in user's role and abort(403) on mismatch.
    """

    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            # TODO(auth-increment): resolve current_user and enforce membership
            # in ``roles``; abort(403) if not permitted.
            return view(*args, **kwargs)

        wrapped.required_roles = roles
        return wrapped

    return decorator
