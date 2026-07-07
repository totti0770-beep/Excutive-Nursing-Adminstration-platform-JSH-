"""Staff blueprint: the Nursing Staff Database (list, search, filter, CRUD)."""
from flask import Blueprint

staff_bp = Blueprint("staff", __name__, url_prefix="/staff")

from app.blueprints.staff import routes  # noqa: E402,F401
