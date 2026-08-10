"""Recognition (Awards) blueprint."""

from flask import Blueprint

from app.i18n import N_

recognition_bp = Blueprint("recognition", __name__, url_prefix="/recognition")

# Predefined award types. The Arabic string IS the value stored on the record
# (recognition.award_type), so it must NOT be translated here: an English UI
# storing English values would fragment the data by the author's language and
# break the award-type filter across languages. N_ registers the literals for
# extraction only; the display label is translated at render time.
AWARD_TYPES = [
    N_("جائزة فلورنس نايتنجيل"),
    N_("ممرض/ممرضة الشهر"),
    N_("شكر وتقدير"),
    N_("التميز في خدمة المرضى"),
    N_("روح الفريق"),
]

from app.blueprints.recognition import routes  # noqa: E402,F401
