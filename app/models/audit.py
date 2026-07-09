"""Audit log model."""

from datetime import datetime

from app.extensions import db


class AuditLog(db.Model):
    """An append-only record of a security-relevant action.

    Captures who did what, to which entity, and when — for CBAHI/JCI-style
    accountability. Rows are never updated or deleted by the application.
    """

    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, index=True
    )
    # Actor (email is denormalised so the log survives user deletion).
    user_id = db.Column(db.Integer, nullable=True, index=True)
    user_email = db.Column(db.String(255), nullable=True)
    # e.g. "login", "logout", "login_failed", "create", "update", "delete".
    action = db.Column(db.String(40), nullable=False, index=True)
    # e.g. "staff", "department", "recognition", "announcement", "user", "auth".
    entity_type = db.Column(db.String(40), nullable=True, index=True)
    entity_id = db.Column(db.Integer, nullable=True)
    detail = db.Column(db.String(500), nullable=True)

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<AuditLog {self.id} {self.action} {self.entity_type}>"
