"""Recognition / award model."""
from datetime import datetime

from app.extensions import db


class Recognition(db.Model):
    """An award or recognition granted to a staff member."""

    __tablename__ = "recognition"

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(
        db.Integer,
        db.ForeignKey("staff.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    award_type = db.Column(db.String(120), nullable=False)
    granted_by = db.Column(db.String(150), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    staff = db.relationship("Staff", back_populates="recognitions")

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<Recognition {self.id} {self.award_type!r}>"
