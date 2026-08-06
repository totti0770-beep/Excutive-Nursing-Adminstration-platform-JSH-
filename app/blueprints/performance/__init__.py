"""Performance metrics blueprint."""

from flask import Blueprint

performance_bp = Blueprint("performance", __name__, url_prefix="/performance")

# Predefined metric names (value == Arabic label; stored directly).
METRICS = [
    "رضا المرضى",
    "الالتزام بالمناوبات",
    "جودة الرعاية",
    "الالتزام بمعايير السلامة",
    "التطوير المهني",
]

from app.blueprints.performance import routes  # noqa: E402,F401
