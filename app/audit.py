"""Audit logging helper.

Call `log_action(...)` from routes to append a security-relevant event. The
current user (if any) is captured automatically; the caller supplies the action
and the affected entity. Commits are the caller's responsibility (the audit row
is added to the active session and flushed with the surrounding transaction).
"""

from flask_login import current_user

from app.extensions import db
from app.models import AuditLog


def log_action(action, entity_type=None, entity_id=None, detail=None, actor_email=None):
    """Add an AuditLog row to the current session (does not commit).

    actor_email overrides the current user's email — used for auth events like
    a failed login where there is no authenticated user yet.
    """
    uid = None
    email = actor_email
    if current_user and current_user.is_authenticated:
        uid = current_user.id
        email = email or current_user.email

    db.session.add(
        AuditLog(
            user_id=uid,
            user_email=email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            detail=(detail[:500] if detail else None),
        )
    )
