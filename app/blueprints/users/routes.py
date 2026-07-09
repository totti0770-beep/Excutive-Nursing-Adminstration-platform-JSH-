"""User management routes: list, create, edit, delete (System Admin only)."""

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.blueprints.users import users_bp
from app.blueprints.users.forms import UserForm
from app.extensions import db
from app.models import Staff, User
from app.security import Roles, role_required

PER_PAGE = 10
MIN_PASSWORD_LEN = 8


def _staff_choices():
    """(0, 'not linked') followed by all staff, labelled with employee id."""
    choices = [(0, "— غير مرتبط —")]
    choices += [
        (s.id, f"{s.name} ({s.employee_id})")
        for s in Staff.query.order_by(Staff.name).all()
    ]
    return choices


def _staff_link_conflict(staff_id, exclude_user_id=None):
    """Return the User already linked to staff_id (other than exclude), if any."""
    if not staff_id:
        return None
    q = User.query.filter(User.staff_id == staff_id)
    if exclude_user_id is not None:
        q = q.filter(User.id != exclude_user_id)
    return q.first()


@users_bp.route("/")
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def list_users():
    q = request.args.get("q", "", type=str).strip()
    role = request.args.get("role", "", type=str).strip()
    page = request.args.get("page", 1, type=int)

    query = User.query
    if q:
        query = query.filter(User.email.ilike(f"%{q}%"))
    if role:
        query = query.filter(User.role == role)

    pagination = query.order_by(User.email).paginate(
        page=page, per_page=PER_PAGE, error_out=False
    )

    return render_template(
        "users/list.html",
        pagination=pagination,
        users=pagination.items,
        roles=Roles.ALL,
        role_label=Roles.label,
        filters={"q": q, "role": role},
    )


@users_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def new_user():
    form = UserForm()
    form.staff_id.choices = _staff_choices()

    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        password = form.password.data or ""
        staff_id = form.staff_id.data or None

        if User.query.filter_by(email=email).first():
            form.email.errors.append("البريد الإلكتروني مستخدم بالفعل")
        elif len(password) < MIN_PASSWORD_LEN:
            form.password.errors.append(
                f"كلمة المرور يجب أن تكون {MIN_PASSWORD_LEN} أحرف على الأقل"
            )
        elif _staff_link_conflict(staff_id):
            form.staff_id.errors.append("هذا الموظف مرتبط بحساب آخر بالفعل")
        else:
            user = User(
                email=email,
                role=form.role.data,
                staff_id=staff_id,
                is_active=form.is_active.data,
            )
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            flash("تمت إضافة المستخدم بنجاح", "success")
            return redirect(url_for("users.list_users"))

    return render_template("users/form.html", form=form, mode="new")


@users_bp.route("/<int:user_id>/edit", methods=["GET", "POST"])
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def edit_user(user_id):
    user = db.get_or_404(User, user_id)
    form = UserForm(obj=user)
    form.staff_id.choices = _staff_choices()
    if request.method == "GET":
        form.staff_id.data = user.staff_id or 0

    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        password = form.password.data or ""
        staff_id = form.staff_id.data or None
        clash = User.query.filter(User.email == email, User.id != user.id).first()
        if clash:
            form.email.errors.append("البريد الإلكتروني مستخدم بالفعل")
        elif password and len(password) < MIN_PASSWORD_LEN:
            form.password.errors.append(
                f"كلمة المرور يجب أن تكون {MIN_PASSWORD_LEN} أحرف على الأقل"
            )
        elif _staff_link_conflict(staff_id, exclude_user_id=user.id):
            form.staff_id.errors.append("هذا الموظف مرتبط بحساب آخر بالفعل")
        else:
            user.email = email
            user.role = form.role.data
            user.staff_id = staff_id
            user.is_active = form.is_active.data
            if password:  # blank keeps the current password
                user.set_password(password)
            db.session.commit()
            flash("تم تحديث بيانات المستخدم", "success")
            return redirect(url_for("users.list_users"))

    return render_template("users/form.html", form=form, mode="edit", user=user)


@users_bp.route("/<int:user_id>/delete", methods=["POST"])
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def delete_user(user_id):
    user = db.get_or_404(User, user_id)
    if user.id == current_user.id:
        flash("لا يمكنك حذف حسابك الحالي", "error")
        return redirect(url_for("users.list_users"))
    db.session.delete(user)
    db.session.commit()
    flash("تم حذف المستخدم", "success")
    return redirect(url_for("users.list_users"))
