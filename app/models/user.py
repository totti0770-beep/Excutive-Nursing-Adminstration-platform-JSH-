"""User (login account) model."""
from datetime import datetime

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

    # --- display helper ---------------------------------------------------
    @property
    def display_name(self):
        """Prefer the linked staff member's name, else the email local part."""
        if self.staff is not None:
            return self.staff.name
        return self.email.split("@")[0]

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<User {self.id} {self.email!r} ({self.role})>"
