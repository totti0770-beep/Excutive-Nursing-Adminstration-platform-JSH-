"""Auth routes."""

from urllib.parse import urlparse

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user

from app.audit import log_action
from app.blueprints.auth import auth_bp
from app.blueprints.auth.forms import LoginForm, PasswordChangeForm
from app.extensions import db, limiter
from app.models import User


def _is_safe_next(target):
    """Only allow same-host relative redirects (prevents open-redirect)."""
    if not target:
        return False
    parsed = urlparse(target)
    return not parsed.netloc and not parsed.scheme and target.startswith("/")


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10 per minute", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        user = User.query.filter_by(email=email).first()
        if user is None or not user.check_password(form.password.data):
            # Generic message: do not reveal whether the email exists.
            log_action("login_failed", "auth", detail=email, actor_email=email)
            db.session.commit()
            flash("بيانات الدخول غير صحيحة", "error")
        elif not user.is_active:
            log_action(
                "login_denied", "auth", detail="inactive account", actor_email=email
            )
            db.session.commit()
            flash("هذا الحساب غير مُفعّل", "error")
        else:
            login_user(user, remember=form.remember.data)
            log_action("login", "auth", entity_id=user.id)
            db.session.commit()
            next_page = request.args.get("next")
            if _is_safe_next(next_page):
                return redirect(next_page)
            return redirect(url_for("main.dashboard"))

    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    log_action("logout", "auth", entity_id=current_user.id)
    db.session.commit()
    logout_user()
    flash("تم تسجيل الخروج بنجاح", "success")
    return redirect(url_for("auth.login"))


@auth_bp.route("/account/password", methods=["GET", "POST"])
@login_required
def change_password():
    form = PasswordChangeForm()
    if form.validate_on_submit():
        if not current_user.check_password(form.current_password.data):
            form.current_password.errors.append("كلمة المرور الحالية غير صحيحة")
        else:
            current_user.set_password(form.new_password.data)
            log_action("password_change", "user", entity_id=current_user.id)
            db.session.commit()
            flash("تم تغيير كلمة المرور بنجاح", "success")
            return redirect(url_for("main.dashboard"))
    return render_template("auth/change_password.html", form=form)
