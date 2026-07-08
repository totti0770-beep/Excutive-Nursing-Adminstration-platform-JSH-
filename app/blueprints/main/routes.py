"""Main blueprint routes."""
from flask import render_template, url_for
from flask_login import login_required
from sqlalchemy import func

from app.blueprints.main import main_bp
from app.extensions import db
from app.models import Department, Performance, Recognition, Staff
from app.security import Roles, role_required


@main_bp.route("/")
@login_required
@role_required(Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR)
def dashboard():
    """Executive dashboard with live KPI counts drawn from the database."""
    total_staff = db.session.scalar(select_count(Staff))
    total_departments = db.session.scalar(select_count(Department))
    total_recognitions = db.session.scalar(select_count(Recognition))
    avg_performance = db.session.scalar(db.select(func.avg(Performance.value)))

    kpis = [
        {"label": "إجمالي طاقم التمريض", "value": total_staff, "icon": "users",
         "accent": "amber", "href": url_for("staff.list_staff")},
        {"label": "الأقسام", "value": total_departments, "icon": "building",
         "accent": "emerald", "href": url_for("departments.list_departments")},
        {"label": "التكريمات الممنوحة", "value": total_recognitions,
         "icon": "award", "accent": "violet",
         "href": url_for("recognition.list_recognition")},
        {"label": "متوسط الأداء", "icon": "activity", "accent": "sky",
         "value": f"{avg_performance:.1f}" if avg_performance is not None else "—"},
    ]
    return render_template("main/dashboard.html", kpis=kpis)


def select_count(model):
    """Helper: SELECT COUNT(*) for a model."""
    return db.select(func.count()).select_from(model)
