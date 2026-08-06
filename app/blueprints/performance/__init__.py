"""Performance metrics blueprint."""

from flask import Blueprint

from app.i18n import N_

performance_bp = Blueprint("performance", __name__, url_prefix="/performance")

# Predefined metric names. As with award types, the Arabic string IS the value
# stored on the record (performance.metric_name), so it is registered for
# extraction with N_ but never translated in place — only on display.
METRICS = [
    N_("رضا المرضى"),
    N_("الالتزام بالمناوبات"),
    N_("جودة الرعاية"),
    N_("الالتزام بمعايير السلامة"),
    N_("التطوير المهني"),
]

from app.blueprints.performance import routes  # noqa: E402,F401
