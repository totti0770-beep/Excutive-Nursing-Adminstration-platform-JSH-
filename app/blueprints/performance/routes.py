"""Performance metrics routes: list (with averages), record, delete."""

from datetime import date as date_cls

from flask import flash, redirect, render_template, request, url_for
from flask_babel import gettext as _
from flask_login import login_required
from sqlalchemy import func

from app.audit import log_action
from app.blueprints.performance import METRICS, performance_bp
from app.blueprints.performance.forms import PerformanceForm
from app.exports import csv_response
from app.extensions import db
from app.models import Department, Performance, Staff
from app.security import Roles, role_required

PER_PAGE = 15
_MANAGE_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR, Roles.DEPARTMENT_HEAD)


def _staff_choices():
    return [
        (s.id, f"{s.name} ({s.employee_id})")
        for s in Staff.query.order_by(Staff.name).all()
    ]


def _filtered_query():
    metric = request.args.get("metric", "", type=str).strip()
    department_id = request.args.get("department_id", type=int)
    query = Performance.query.join(Staff)
    if metric:
        query = query.filter(Performance.metric_name == metric)
    if department_id:
        query = query.filter(Staff.department_id == department_id)
    return query, metric, department_id


@performance_bp.route("/")
@login_required
@role_required(*_MANAGE_ROLES)
def list_performance():
    query, metric, department_id = _filtered_query()
    page = request.args.get("page", 1, type=int)
    pagination = query.order_by(Performance.date.desc()).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    # Average per metric (overall, unfiltered) for the summary panel.
    averages = (
        db.session.query(
            Performance.metric_name, func.avg(Performance.value).label("avg")
        )
        .group_by(Performance.metric_name)
        .all()
    )

    return render_template(
        "performance/list.html",
        pagination=pagination,
        entries=pagination.items,
        metrics=METRICS,
        departments=Department.query.order_by(Department.name).all(),
        averages=averages,
        filters={"metric": metric, "department_id": department_id},
    )


@performance_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def new_performance():
    form = PerformanceForm()
    form.staff_id.choices = _staff_choices()
    if not form.staff_id.choices:
        flash(_("لا يوجد موظفون. الرجاء إضافة موظف أولاً."), "info")
        return redirect(url_for("staff.list_staff"))

    if form.validate_on_submit():
        rec = Performance(
            staff_id=form.staff_id.data,
            metric_name=form.metric_name.data,
            value=float(form.value.data),
            date=form.date.data or date_cls.today(),
        )
        db.session.add(rec)
        db.session.flush()
        log_action("create", "performance", rec.id, rec.metric_name)
        db.session.commit()
        flash(_("تم تسجيل المؤشر بنجاح"), "success")
        return redirect(url_for("performance.list_performance"))

    return render_template("performance/form.html", form=form)


@performance_bp.route("/export.csv")
@login_required
@role_required(*_MANAGE_ROLES)
def export_csv():
    # CSV headers and the status values are deliberately NOT translated:
    # an export is data interchange, and a header that changed with the
    # exporter's interface language would break downstream consumers.
    query, _metric, _department_id = _filtered_query()
    rows = [
        [
            e.staff.name if e.staff else "",
            e.staff.employee_id if e.staff else "",
            e.staff.department.name if e.staff and e.staff.department else "",
            e.metric_name,
            e.value,
            e.date.strftime("%Y-%m-%d"),
        ]
        for e in query.order_by(Performance.date.desc()).all()
    ]
    log_action("export", "performance", detail=f"{len(rows)} rows")
    db.session.commit()
    header = ["الاسم", "الرقم الوظيفي", "القسم", "المؤشر", "القيمة", "التاريخ"]
    return csv_response("performance.csv", header, rows)


@performance_bp.route("/<int:perf_id>/delete", methods=["POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def delete_performance(perf_id):
    rec = db.get_or_404(Performance, perf_id)
    log_action("delete", "performance", rec.id, rec.metric_name)
    db.session.delete(rec)
    db.session.commit()
    flash(_("تم حذف المؤشر"), "success")
    return redirect(url_for("performance.list_performance"))
