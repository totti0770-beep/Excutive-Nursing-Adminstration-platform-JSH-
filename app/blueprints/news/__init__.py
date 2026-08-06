"""News / Announcements blueprint (news feed + notification center)."""

from flask import Blueprint
from flask_babel import lazy_gettext as _l

news_bp = Blueprint("news", __name__, url_prefix="/news")

# Stored category value -> display label. The key is what is written to
# announcements.category, so only the label is localised.
CATEGORIES = {
    "news": _l("أخبار"),
    "announcement": _l("إعلان"),
    "event": _l("فعالية"),
}

from app.blueprints.news import routes  # noqa: E402,F401
