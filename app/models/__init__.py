"""Model package.

Importing every model here ensures they are registered on SQLAlchemy's
metadata so Flask-Migrate/Alembic can autogenerate migrations for all tables.
"""

from app.models.announcement import Announcement
from app.models.audit import AuditLog
from app.models.department import Department
from app.models.performance import Performance
from app.models.recognition import Recognition
from app.models.staff import Staff
from app.models.user import User

__all__ = [
    "Department",
    "Staff",
    "Performance",
    "Recognition",
    "User",
    "Announcement",
    "AuditLog",
]
