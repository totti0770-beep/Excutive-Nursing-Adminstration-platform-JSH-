"""Recognition (Awards) blueprint."""

from flask import Blueprint

recognition_bp = Blueprint("recognition", __name__, url_prefix="/recognition")

# Predefined award types (value == Arabic label; stored directly on the record).
AWARD_TYPES = [
    "جائزة فلورنس نايتنجيل",
    "ممرض/ممرضة الشهر",
    "شكر وتقدير",
    "التميز في خدمة المرضى",
    "روح الفريق",
]

from app.blueprints.recognition import routes  # noqa: E402,F401
