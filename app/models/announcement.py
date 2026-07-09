"""Announcement / news model."""

from datetime import datetime

from app.extensions import db


class Announcement(db.Model):
    """A news item, announcement, or event shown in the news feed."""

    __tablename__ = "announcements"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    # One of news / announcement / event (see app.blueprints.news.CATEGORIES).
    category = db.Column(
        db.String(40), nullable=False, default="announcement", index=True
    )
    is_published = db.Column(
        db.Boolean, nullable=False, default=True, server_default=db.true(), index=True
    )
    pinned = db.Column(
        db.Boolean, nullable=False, default=False, server_default=db.false()
    )
    created_by = db.Column(db.String(150), nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, index=True
    )

    def __repr__(self):  # pragma: no cover - debug helper
        return f"<Announcement {self.id} {self.title!r}>"
