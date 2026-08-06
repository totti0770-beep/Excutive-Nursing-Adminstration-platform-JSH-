"""Recognition (Awards) routes: list, assign, delete."""

from datetime import datetime

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from sqlalchemy import func

from app.audit import log_action
from app.blueprints.recognition import AWARD_TYPES, recognition_bp
from app.blueprints.recognition.forms import RecognitionForm
from app.exports import csv_response
from app.extensions import db
from app.models import Department, Recognition, Staff
from app.security import Roles, role_required

PER_PAGE = 10
_MANAGE_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR, Roles.DEPARTMENT_HEAD)


def _staff_choices():
    return [
        (s.id, f"{s.name} ({s.employee_id})")
        for s in Staff.query.order_by(Staff.name).all()
    ]


def _filtered_query():
    award_type = request.args.get("award_type", "", type=str).strip()
    department_id = request.args.get("department_id", type=int)
    query = Recognition.query.join(Staff)
    if award_type:
        query = query.filter(Recognition.award_type == award_type)
    if department_id:
        query = query.filter(Staff.department_id == department_id)
    return query, {"award_type": award_type, "department_id": department_id}


@recognition_bp.route("/")
@login_required
@role_required(*_MANAGE_ROLES)
def list_recognition():
    page = request.args.get("page", 1, type=int)
    query, filters = _filtered_query()

    pagination = query.order_by(Recognition.timestamp.desc()).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    # Top recipients (by award count).
    top_recipients = (
        db.session.query(Staff.name, func.count(Recognition.id).label("cnt"))
        .join(Recognition, Recognition.staff_id == Staff.id)
        .group_by(Staff.id)
        .order_by(func.count(Recognition.id).desc())
        .limit(5)
        .all()
    )

    return render_template(
        "recognition/list.html",
        pagination=pagination,
        items=pagination.items,
        award_types=AWARD_TYPES,
        departments=Department.query.order_by(Department.name).all(),
        top_recipients=top_recipients,
        filters=filters,
    )


@recognition_bp.route("/export.csv")
@login_required
@role_required(*_MANAGE_ROLES)
def export_csv():
    query, _ = _filtered_query()
    rows = [
        [
            r.staff.name if r.staff else "",
            r.staff.department.name if r.staff and r.staff.department else "",
            r.award_type,
            r.granted_by or "",
            r.note or "",
            r.timestamp.strftime("%Y-%m-%d"),
        ]
        for r in query.order_by(Recognition.timestamp.desc()).all()
    ]
    log_action("export", "recognition", detail=f"{len(rows)} rows")
    db.session.commit()
    header = ["الموظف", "القسم", "نوع التكريم", "مُنح بواسطة", "السبب", "التاريخ"]
    return csv_response("recognition.csv", header, rows)


@recognition_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def new_recognition():
    form = RecognitionForm()
    form.staff_id.choices = _staff_choices()
    if request.method == "GET" and not form.granted_by.data:
        form.granted_by.data = current_user.display_name

    if not form.staff_id.choices:
        flash("لا يوجد موظفون. الرجاء إضافة موظف أولاً.", "info")
        return redirect(url_for("staff.list_staff"))

    if form.validate_on_submit():
        awarded_on = form.awarded_on.data
        ts = (
            datetime.combine(awarded_on, datetime.min.time())
            if awarded_on
            else datetime.utcnow()
        )
        rec = Recognition(
            staff_id=form.staff_id.data,
            award_type=form.award_type.data,
            granted_by=(form.granted_by.data or "").strip() or None,
            note=(form.note.data or "").strip() or None,
            timestamp=ts,
        )
        db.session.add(rec)
        db.session.flush()
        log_action("create", "recognition", rec.id, rec.award_type)
        db.session.commit()
        flash("تم منح التكريم بنجاح", "success")
        return redirect(url_for("recognition.list_recognition"))

    return render_template("recognition/form.html", form=form)


@recognition_bp.route("/<int:rec_id>/delete", methods=["POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def delete_recognition(rec_id):
    rec = db.get_or_404(Recognition, rec_id)
    log_action("delete", "recognition", rec.id, rec.award_type)
    db.session.delete(rec)
    db.session.commit()
    flash("تم حذف التكريم", "success")
    return redirect(url_for("recognition.list_recognition"))
