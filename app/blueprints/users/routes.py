"""User management routes: list, create, edit, delete (System Admin only)."""

from flask import flash, redirect, render_template, request, url_for
from flask_babel import gettext as _
from flask_login import current_user, login_required

from app.audit import log_action
from app.blueprints.users import users_bp
from app.blueprints.users.forms import UserForm
from app.extensions import db
from app.models import Staff, User
from app.security import Roles, role_required, validate_password_strength

PER_PAGE = 10


def _staff_choices():
    """(0, 'not linked') followed by all staff, labelled with employee id."""
    choices = [(0, _("— غير مرتبط —"))]
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
            form.email.errors.append(_("البريد الإلكتروني مستخدم بالفعل"))
        elif validate_password_strength(password, email):
            form.password.errors.extend(validate_password_strength(password, email))
        elif _staff_link_conflict(staff_id):
            form.staff_id.errors.append(_("هذا الموظف مرتبط بحساب آخر بالفعل"))
        else:
            user = User(
                email=email,
                role=form.role.data,
                staff_id=staff_id,
                is_active=form.is_active.data,
            )
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
            log_action("create", "user", user.id, user.email)
            db.session.commit()
            flash(_("تمت إضافة المستخدم بنجاح"), "success")
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
            form.email.errors.append(_("البريد الإلكتروني مستخدم بالفعل"))
        # A blank password on edit means "keep the current one", so only
        # validate when the admin actually supplied a new value.
        elif password and validate_password_strength(password, email):
            form.password.errors.extend(validate_password_strength(password, email))
        elif _staff_link_conflict(staff_id, exclude_user_id=user.id):
            form.staff_id.errors.append(_("هذا الموظف مرتبط بحساب آخر بالفعل"))
        else:
            user.email = email
            user.role = form.role.data
            user.staff_id = staff_id
            user.is_active = form.is_active.data
            if password:  # blank keeps the current password
                user.set_password(password)
            log_action("update", "user", user.id, user.email)
            db.session.commit()
            flash(_("تم تحديث بيانات المستخدم"), "success")
            return redirect(url_for("users.list_users"))

    return render_template("users/form.html", form=form, mode="edit", user=user)


@users_bp.route("/<int:user_id>/unlock", methods=["POST"])
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def unlock_user(user_id):
    """Release a brute-force lockout early.

    An escape hatch, not the normal path: locks expire on their own after
    LOGIN_LOCKOUT_MINUTES, so nobody is stranded waiting for an administrator.
    """
    user = db.get_or_404(User, user_id)
    user.clear_lockout()
    log_action("account_unlocked", "user", user.id, user.email)
    db.session.commit()
    flash(_("تم إلغاء قفل الحساب"), "success")
    return redirect(url_for("users.list_users"))


@users_bp.route("/<int:user_id>/delete", methods=["POST"])
@login_required
@role_required(Roles.SYSTEM_ADMIN)
def delete_user(user_id):
    user = db.get_or_404(User, user_id)
    if user.id == current_user.id:
        flash(_("لا يمكنك حذف حسابك الحالي"), "error")
        return redirect(url_for("users.list_users"))
    log_action("delete", "user", user.id, user.email)
    db.session.delete(user)
    db.session.commit()
    flash(_("تم حذف المستخدم"), "success")
    return redirect(url_for("users.list_users"))
