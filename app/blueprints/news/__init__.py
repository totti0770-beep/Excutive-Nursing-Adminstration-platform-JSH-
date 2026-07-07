"""News / Announcements blueprint (news feed + notification center)."""
from flask import Blueprint

news_bp = Blueprint("news", __name__, url_prefix="/news")

# category value -> Arabic label
CATEGORIES = {
    "news": "أخبار",
    "announcement": "إعلان",
    "event": "فعالية",
}

from app.blueprints.news import routes  # noqa: E402,F401
