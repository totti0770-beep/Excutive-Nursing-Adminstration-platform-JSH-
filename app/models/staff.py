"""Staff (nursing personnel) model."""

from app.extensions import db


class Staff(db.Model):
    """A nurse or nursing-administration staff member.

    Belongs to one department and has many performance records and
    recognitions (one-to-many on each).
    """

    __tablename__ = "staff"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    # Business identifier from the hospital HR system; must be unique.
    employee_id = db.Column(db.String(50), nullable=False, unique=True, index=True)
    # Job role (aligned with app.security.Roles vocabulary where applicable).
    role = db.Column(db.String(80), nullable=True)

    # Optional directory/profile fields.
    email = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(40), nullable=True)
    # server_default so adding this NOT NULL column works on existing rows
    # (required by SQLite; harmless on PostgreSQL).
    is_active = db.Column(
        db.Boolean, nullable=False, default=True, server_default=db.true()
    )
    hire_date = db.Column(db.Date, nullable=True)

    department_id = db.Column(
        db.Integer,
        db.ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    department = db.relationship("Department", back_populates="staff")

    performance_records = db.relationship(
        "Performance",
        back_populates="staff",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    recognitions = db.relationship(
        "Recognition",
        back_populates="staff",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<Staff {self.id} {self.name!r} ({self.employee_id})>"
