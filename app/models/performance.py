"""Performance metric model."""
from datetime import datetime

from app.extensions import db


class Performance(db.Model):
    """A single performance metric measurement for a staff member."""

    __tablename__ = "performance"

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(
        db.Integer,
        db.ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_name = db.Column(db.String(120), nullable=False)
    value = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)

    staff = db.relationship("Staff", back_populates="performance_records")

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<Performance {self.id} {self.metric_name!r}={self.value}>"
