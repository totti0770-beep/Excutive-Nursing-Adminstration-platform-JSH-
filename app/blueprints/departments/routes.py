"""Departments routes: list (with staff counts), detail, and CRUD."""

from flask import flash, redirect, render_template, request, url_for
from flask_babel import gettext as _
from flask_login import login_required
from sqlalchemy import func

from app.audit import log_action
from app.blueprints.departments import departments_bp
from app.blueprints.departments.forms import DepartmentForm
from app.extensions import db
from app.models import Department, Staff
from app.security import Roles, role_required

PER_PAGE = 10
_MANAGE_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR, Roles.DEPARTMENT_HEAD)


@departments_bp.route("/")
@login_required
@role_required(*_MANAGE_ROLES)
def list_departments():
    q = request.args.get("q", "", type=str).strip()
    page = request.args.get("page", 1, type=int)

    # Single query: departments + staff count (no N+1).
    query = (
        db.session.query(Department, func.count(Staff.id).label("staff_count"))
        .outerjoin(Staff, Staff.department_id == Department.id)
        .group_by(Department.id)
    )
    if q:
        query = query.filter(Department.name.ilike(f"%{q}%"))

    pagination = query.order_by(Department.name).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    return render_template(
        "departments/list.html",
        pagination=pagination,
        rows=pagination.items,  # list of (Department, staff_count) tuples
        filters={"q": q},
    )


@departments_bp.route("/<int:dept_id>")
@login_required
@role_required(*_MANAGE_ROLES)
def detail(dept_id):
    dept = db.get_or_404(Department, dept_id)
    roster = Staff.query.filter_by(department_id=dept.id).order_by(Staff.name).all()
    return render_template(
        "departments/detail.html", dept=dept, roster=roster, role_label=Roles.label
    )


@departments_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def new_department():
    form = DepartmentForm()
    if form.validate_on_submit():
        name = form.name.data.strip()
        if Department.query.filter_by(name=name).first():
            form.name.errors.append(_("اسم القسم مستخدم بالفعل"))
        else:
            dept = Department(
                name=name,
                location=(form.location.data or "").strip() or None,
                head_name=(form.head_name.data or "").strip() or None,
            )
            db.session.add(dept)
            db.session.flush()
            log_action("create", "department", dept.id, dept.name)
            db.session.commit()
            flash(_("تمت إضافة القسم بنجاح"), "success")
            return redirect(url_for("departments.list_departments"))
    return render_template("departments/form.html", form=form, mode="new")


@departments_bp.route("/<int:dept_id>/edit", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def edit_department(dept_id):
    dept = db.get_or_404(Department, dept_id)
    form = DepartmentForm(obj=dept)
    if form.validate_on_submit():
        name = form.name.data.strip()
        clash = Department.query.filter(
            Department.name == name, Department.id != dept.id
        ).first()
        if clash:
            form.name.errors.append(_("اسم القسم مستخدم بالفعل"))
        else:
            dept.name = name
            dept.location = (form.location.data or "").strip() or None
            dept.head_name = (form.head_name.data or "").strip() or None
            log_action("update", "department", dept.id, dept.name)
            db.session.commit()
            flash(_("تم تحديث بيانات القسم"), "success")
            return redirect(url_for("departments.detail", dept_id=dept.id))
    return render_template("departments/form.html", form=form, mode="edit", dept=dept)


@departments_bp.route("/<int:dept_id>/delete", methods=["POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def delete_department(dept_id):
    dept = db.get_or_404(Department, dept_id)
    staff_count = Staff.query.filter_by(department_id=dept.id).count()
    if staff_count:
        flash(
            _(
                "لا يمكن حذف قسم يحتوي على موظفين (%(count)d). "
                "الرجاء نقل الموظفين إلى قسم آخر أولاً.",
                count=staff_count,
            ),
            "error",
        )
        return redirect(url_for("departments.detail", dept_id=dept.id))
    log_action("delete", "department", dept.id, dept.name)
    db.session.delete(dept)
    db.session.commit()
    flash(_("تم حذف القسم"), "success")
    return redirect(url_for("departments.list_departments"))
