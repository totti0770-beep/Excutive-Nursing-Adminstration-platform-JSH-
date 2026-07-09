"""Application factory for the Nursing Executive Administration System.

Uses the app-factory pattern so the app can be instantiated with different
configs (development, production, testing) and so extensions are bound in a
single, well-defined place.
"""

from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, session

from app.config import get_config
from app.extensions import csrf, db, limiter, login_manager, migrate, talisman


def create_app(config_object=None):
    # Load .env before reading any configuration.
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    # Harden session cookies (Secure is only enforced in production/HTTPS).
    app.config.setdefault("SESSION_COOKIE_HTTPONLY", True)
    app.config.setdefault("SESSION_COOKIE_SAMESITE", "Lax")
    app.config.setdefault("SESSION_COOKIE_SECURE", not app.config.get("DEBUG", False))
    # Idle session timeout (sliding; refreshed on each request).
    app.config.setdefault("PERMANENT_SESSION_LIFETIME", timedelta(hours=8))

    # Initialise extensions.
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "الرجاء تسجيل الدخول للوصول إلى هذه الصفحة."
    limiter.init_app(app)
    # Security headers. HTTPS redirect only in production; a strict CSP is
    # possible because there is no inline JS/CSS (see static/js/app.js).
    talisman.init_app(
        app,
        force_https=app.config.get("FORCE_HTTPS", False),
        session_cookie_secure=app.config.get("SESSION_COOKIE_SECURE", False),
        content_security_policy={"default-src": "'self'"},
    )

    # Import models so they are registered on the metadata (needed for
    # migrations and for `flask shell` convenience).
    from app import models  # noqa: F401

    @login_manager.user_loader
    def load_user(user_id):
        user = db.session.get(models.User, int(user_id))
        # A user deactivated mid-session is logged out on their next request.
        if user is not None and not user.is_active:
            return None
        return user

    @app.before_request
    def _make_session_permanent():
        session.permanent = True

    # Register blueprints.
    from app.blueprints.audit import audit_bp
    from app.blueprints.auth import auth_bp
    from app.blueprints.departments import departments_bp
    from app.blueprints.main import main_bp
    from app.blueprints.news import news_bp
    from app.blueprints.recognition import recognition_bp
    from app.blueprints.staff import staff_bp
    from app.blueprints.users import users_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(recognition_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(departments_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(audit_bp)

    # Notification bell: recent (last 7 days) published announcements count,
    # available to every template.
    @app.context_processor
    def inject_recent_news_count():
        from datetime import datetime, timedelta

        from flask_login import current_user

        if not current_user.is_authenticated:
            return {"recent_news_count": 0}
        since = datetime.utcnow() - timedelta(days=7)
        count = models.Announcement.query.filter(
            models.Announcement.is_published.is_(True),
            models.Announcement.created_at >= since,
        ).count()
        return {"recent_news_count": count}

    # Roles allowed to see the executive dashboard / manage-only sections,
    # so templates (e.g. the sidebar) can render role-appropriate navigation.
    @app.context_processor
    def inject_dashboard_roles():
        from app.security import Roles

        return {
            "dashboard_roles": (
                Roles.SYSTEM_ADMIN,
                Roles.NURSING_DIRECTOR,
                Roles.DEPARTMENT_HEAD,
            ),
            "system_admin_role": Roles.SYSTEM_ADMIN,
        }

    # Register CLI commands.
    from app.commands import register_commands

    register_commands(app)

    return app
