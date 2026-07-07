"""Department model."""
from app.extensions import db


class Department(db.Model):
    """An organisational unit within the Nursing Administration.

    A department has many staff members (one-to-many).
    """

    __tablename__ = "departments"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True, index=True)
    location = db.Column(db.String(150), nullable=True)

    # One-to-many: Department -> Staff
    staff = db.relationship(
        "Staff",
        back_populates="department",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<Department {self.id} {self.name!r}>"
