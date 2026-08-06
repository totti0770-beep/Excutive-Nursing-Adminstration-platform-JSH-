"""Audit log viewer routes (System Admin only, read-only)."""

from flask import render_template, request
from flask_login import login_required

from app.blueprints.audit import audit_bp
from app.models import AuditLog
from app.security import Roles, role_required

PER_PAGE = 25


@audit_bp.route("/")
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def list_audit():
    action = request.args.get("action", "", type=str).strip()
    entity_type = request.args.get("entity_type", "", type=str).strip()
    page = request.args.get("page", 1, type=int)

    query = AuditLog.query
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    pagination = query.order_by(AuditLog.timestamp.desc()).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    # Distinct values for the filter dropdowns.
    actions = [
        r[0] for r in AuditLog.query.with_entities(AuditLog.action).distinct().all()
    ]
    entity_types = [
        r[0]
        for r in AuditLog.query.with_entities(AuditLog.entity_type).distinct().all()
        if r[0]
    ]

    return render_template(
        "audit/list.html",
        pagination=pagination,
        entries=pagination.items,
        actions=sorted(actions),
        entity_types=sorted(entity_types),
        filters={"action": action, "entity_type": entity_type},
    )
