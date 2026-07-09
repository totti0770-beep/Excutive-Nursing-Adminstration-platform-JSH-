"""Staff (Nursing Staff Database) routes: list, search, filter, and CRUD."""

from flask import flash, redirect, render_template, request, url_for
from flask_login import login_required
from sqlalchemy import or_

from app.audit import log_action
from app.blueprints.staff import staff_bp
from app.blueprints.staff.forms import StaffForm
from app.extensions import db
from app.models import Department, Staff
from app.security import Roles, role_required

PER_PAGE = 10
_MANAGE_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR, Roles.DEPARTMENT_HEAD)


def _department_choices():
    return [(d.id, d.name) for d in Department.query.order_by(Department.name).all()]


@staff_bp.route("/")
@login_required
@role_required(*_MANAGE_ROLES)
def list_staff():
    q = request.args.get("q", "", type=str).strip()
    department_id = request.args.get("department_id", type=int)
    role = request.args.get("role", "", type=str).strip()
    status = request.args.get("status", "", type=str).strip()  # active|inactive|""
    page = request.args.get("page", 1, type=int)

    query = Staff.query
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Staff.name.ilike(like), Staff.employee_id.ilike(like)))
    if department_id:
        query = query.filter(Staff.department_id == department_id)
    if role:
        query = query.filter(Staff.role == role)
    if status == "active":
        query = query.filter(Staff.is_active.is_(True))
    elif status == "inactive":
        query = query.filter(Staff.is_active.is_(False))

    pagination = query.order_by(Staff.name).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    return render_template(
        "staff/list.html",
        pagination=pagination,
        staff_list=pagination.items,
        departments=Department.query.order_by(Department.name).all(),
        roles=Roles.ALL,
        role_label=Roles.label,
        filters={
            "q": q,
            "department_id": department_id,
            "role": role,
            "status": status,
        },
    )


@staff_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def new_staff():
    form = StaffForm()
    form.department_id.choices = _department_choices()

    if form.validate_on_submit():
        emp_id = form.employee_id.data.strip()
        if Staff.query.filter_by(employee_id=emp_id).first():
            form.employee_id.errors.append("الرقم الوظيفي مستخدم بالفعل")
        else:
            member = Staff()
            _apply(form, member)
            db.session.add(member)
            db.session.flush()
            log_action("create", "staff", member.id, member.name)
            db.session.commit()
            flash("تمت إضافة الموظف بنجاح", "success")
            return redirect(url_for("staff.list_staff"))

    return render_template("staff/form.html", form=form, mode="new")


@staff_bp.route("/<int:staff_id>/edit", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def edit_staff(staff_id):
    member = db.get_or_404(Staff, staff_id)
    form = StaffForm(obj=member)
    form.department_id.choices = _department_choices()

    if form.validate_on_submit():
        emp_id = form.employee_id.data.strip()
        clash = Staff.query.filter(
            Staff.employee_id == emp_id, Staff.id != member.id
        ).first()
        if clash:
            form.employee_id.errors.append("الرقم الوظيفي مستخدم بالفعل")
        else:
            _apply(form, member)
            log_action("update", "staff", member.id, member.name)
            db.session.commit()
            flash("تم تحديث بيانات الموظف", "success")
            return redirect(url_for("staff.list_staff"))

    return render_template("staff/form.html", form=form, mode="edit", member=member)


@staff_bp.route("/<int:staff_id>/delete", methods=["POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def delete_staff(staff_id):
    member = db.get_or_404(Staff, staff_id)
    log_action("delete", "staff", member.id, member.name)
    db.session.delete(member)
    db.session.commit()
    flash("تم حذف الموظف", "success")
    return redirect(url_for("staff.list_staff"))


def _apply(form, member):
    """Copy validated form values onto a Staff instance."""
    member.name = form.name.data.strip()
    member.employee_id = form.employee_id.data.strip()
    member.role = form.role.data
    member.department_id = form.department_id.data
    member.email = (form.email.data or "").strip() or None
    member.phone = (form.phone.data or "").strip() or None
    member.hire_date = form.hire_date.data
    member.is_active = form.is_active.data
