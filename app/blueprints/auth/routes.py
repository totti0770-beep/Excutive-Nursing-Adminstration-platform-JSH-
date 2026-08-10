"""Auth routes."""

from flask import current_app, flash, redirect, render_template, request, url_for
from flask_babel import gettext as _
from flask_login import current_user, login_required, login_user, logout_user

from app.audit import log_action
from app.blueprints.auth import auth_bp
from app.blueprints.auth.forms import LoginForm, PasswordChangeForm
from app.extensions import db, limiter
from app.models import User
from app.security import is_safe_redirect_target as _is_safe_next
from app.security import validate_password_strength


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10 per minute", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data.strip().lower()
        user = User.query.filter_by(email=email).first()

        # The lock is checked before the password, and reports the *same*
        # generic message as bad credentials. Saying "this account is locked"
        # would confirm the address exists, handing an attacker the account
        # enumeration that the generic message exists to prevent.
        if user is not None and user.is_locked:
            log_action("login_locked", "auth", entity_id=user.id, actor_email=email)
            db.session.commit()
            flash(_("بيانات الدخول غير صحيحة"), "error")
        elif user is None or not user.check_password(form.password.data):
            if user is not None:
                user.register_failed_login(
                    current_app.config["LOGIN_MAX_FAILED_ATTEMPTS"],
                    current_app.config["LOGIN_LOCKOUT_MINUTES"],
                )
            # Generic message: do not reveal whether the email exists.
            log_action("login_failed", "auth", detail=email, actor_email=email)
            db.session.commit()
            flash(_("بيانات الدخول غير صحيحة"), "error")
        elif not user.is_active:
            log_action(
                "login_denied", "auth", detail="inactive account", actor_email=email
            )
            db.session.commit()
            flash(_("هذا الحساب غير مُفعّل"), "error")
        else:
            # Correct credentials clear the counter, so an eventual success
            # never leaves a partial failure streak behind.
            user.clear_lockout()
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
    flash(_("تم تسجيل الخروج بنجاح"), "success")
    return redirect(url_for("auth.login"))


@auth_bp.route("/account/password", methods=["GET", "POST"])
@login_required
def change_password():
    form = PasswordChangeForm()
    if form.validate_on_submit():
        problems = validate_password_strength(
            form.new_password.data, current_user.email
        )
        if not current_user.check_password(form.current_password.data):
            form.current_password.errors.append(_("كلمة المرور الحالية غير صحيحة"))
        elif problems:
            form.new_password.errors.extend(problems)
        else:
            current_user.set_password(form.new_password.data)
            log_action("password_change", "user", entity_id=current_user.id)
            db.session.commit()
            flash(_("تم تغيير كلمة المرور بنجاح"), "success")
            return redirect(url_for("main.dashboard"))
    return render_template("auth/change_password.html", form=form)
