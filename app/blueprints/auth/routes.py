"""Auth routes."""
from urllib.parse import urlparse

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user

from app.blueprints.auth import auth_bp
from app.blueprints.auth.forms import LoginForm
from app.models import User


def _is_safe_next(target):
    """Only allow same-host relative redirects (prevents open-redirect)."""
    if not target:
        return False
    parsed = urlparse(target)
    return not parsed.netloc and not parsed.scheme and target.startswith("/")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data.strip().lower()).first()
        if user is None or not user.check_password(form.password.data):
            # Generic message: do not reveal whether the email exists.
            flash("بيانات الدخول غير صحيحة", "error")
        elif not user.is_active:
            flash("هذا الحساب غير مُفعّل", "error")
        else:
            login_user(user, remember=form.remember.data)
            next_page = request.args.get("next")
            if _is_safe_next(next_page):
                return redirect(next_page)
            return redirect(url_for("main.dashboard"))

    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    flash("تم تسجيل الخروج بنجاح", "success")
    return redirect(url_for("auth.login"))
