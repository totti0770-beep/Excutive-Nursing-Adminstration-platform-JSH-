"""Departments blueprint: department directory and management."""
from flask import Blueprint

departments_bp = Blueprint("departments", __name__, url_prefix="/departments")

from app.blueprints.departments import routes  # noqa: E402,F401
