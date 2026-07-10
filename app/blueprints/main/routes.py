"""Main blueprint routes."""

from flask import jsonify, redirect, render_template, url_for
from flask_login import current_user, login_required
from sqlalchemy import func, text

from app.blueprints.main import main_bp
from app.blueprints.news import CATEGORIES as NEWS_CATEGORIES
from app.extensions import db
from app.models import Announcement, Department, Performance, Recognition, Staff
from app.security import Roles


@main_bp.route("/healthz")
def healthz():
    """Liveness/readiness probe for load balancers (no auth). Pings the DB."""
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify(status="ok"), 200
    except Exception:  # pragma: no cover - only on a real DB outage
        return jsonify(status="error"), 503


_DASHBOARD_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR, Roles.DEPARTMENT_HEAD)


@main_bp.route("/")
@login_required
def dashboard():
    """Executive dashboard with live KPI counts drawn from the database.

    Staff nurses (and any role without dashboard access) are sent to their own
    landing page instead of hitting a 403 on the app's entry point.
    """
    if current_user.role not in _DASHBOARD_ROLES:
        return redirect(url_for("main.my_home"))

    total_staff = db.session.scalar(select_count(Staff))
    total_departments = db.session.scalar(select_count(Department))
    total_recognitions = db.session.scalar(select_count(Recognition))
    avg_performance = db.session.scalar(db.select(func.avg(Performance.value)))

    kpis = [
        {
            "label": "إجمالي طاقم التمريض",
            "value": total_staff,
            "icon": "users",
            "accent": "amber",
            "href": url_for("staff.list_staff"),
        },
        {
            "label": "الأقسام",
            "value": total_departments,
            "icon": "building",
            "accent": "emerald",
            "href": url_for("departments.list_departments"),
        },
        {
            "label": "التكريمات الممنوحة",
            "value": total_recognitions,
            "icon": "award",
            "accent": "violet",
            "href": url_for("recognition.list_recognition"),
        },
        {
            "label": "متوسط الأداء",
            "icon": "activity",
            "accent": "sky",
            "value": f"{avg_performance:.1f}" if avg_performance is not None else "—",
        },
    ]
    return render_template("main/dashboard.html", kpis=kpis)


@main_bp.route("/me")
@login_required
def my_home():
    """Personal landing page for roles without dashboard/manage access
    (e.g. staff nurses): their profile, their own awards, and recent news.
    """
    staff = current_user.staff if current_user.staff_id else None
    my_recognitions = []
    if staff is not None:
        my_recognitions = (
            Recognition.query.filter_by(staff_id=staff.id)
            .order_by(Recognition.timestamp.desc())
            .limit(10)
            .all()
        )
    recent_news = (
        Announcement.query.filter_by(is_published=True)
        .order_by(Announcement.pinned.desc(), Announcement.created_at.desc())
        .limit(3)
        .all()
    )
    return render_template(
        "main/my_home.html",
        staff=staff,
        my_recognitions=my_recognitions,
        recent_news=recent_news,
        news_categories=NEWS_CATEGORIES,
    )


def select_count(model):
    """Helper: SELECT COUNT(*) for a model."""
    return db.select(func.count()).select_from(model)
