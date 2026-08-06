"""Audit log viewer blueprint (System Admin only)."""

from flask import Blueprint

audit_bp = Blueprint("audit", __name__, url_prefix="/audit")

from app.blueprints.audit import routes  # noqa: E402,F401
