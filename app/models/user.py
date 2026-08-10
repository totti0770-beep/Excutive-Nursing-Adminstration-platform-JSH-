"""User (login account) model."""

from datetime import datetime, timedelta

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


class User(UserMixin, db.Model):
    """A login account with a role.

    Optionally linked to a Staff profile (a login does not have to correspond
    to a staff record). Passwords are never stored in plaintext — only a salted
    hash is persisted.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    # Role drives RBAC; values come from app.security.Roles.
    role = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    # Preferred interface language ("ar"/"en"). NULL means "not chosen yet",
    # so the browser's Accept-Language decides until the user picks one.
    locale = db.Column(db.String(5), nullable=True)

    # Brute-force protection. server_default so the column can be added to
    # existing rows; locked_until NULL means "not locked".
    failed_login_count = db.Column(
        db.Integer, nullable=False, default=0, server_default="0"
    )
    locked_until = db.Column(db.DateTime, nullable=True)

    # Optional link to a staff profile.
    staff_id = db.Column(
        db.Integer,
        db.ForeignKey("staff.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    staff = db.relationship("Staff")

    # --- password helpers -------------------------------------------------
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # --- lockout helpers --------------------------------------------------
    @property
    def is_locked(self):
        """True while a lockout window is still open.

        Expiry is implicit: once `locked_until` is in the past the account
        unlocks itself, so a mistyped password never needs an administrator.
        """
        return self.locked_until is not None and self.locked_until > datetime.utcnow()

    def register_failed_login(self, max_attempts, lockout_minutes):
        """Count a failed attempt and lock the account once it hits the limit."""
        self.failed_login_count = (self.failed_login_count or 0) + 1
        if self.failed_login_count >= max_attempts:
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
        return self.is_locked

    def clear_lockout(self):
        """Reset the failure counter and release any lock."""
        self.failed_login_count = 0
        self.locked_until = None

    # --- display helper ---------------------------------------------------
    @property
    def display_name(self):
        """Prefer the linked staff member's name, else the email local part."""
        if self.staff is not None:
            return self.staff.name
        return self.email.split("@")[0]

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<User {self.id} {self.email!r} ({self.role})>"
