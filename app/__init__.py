"""Application factory for the Nursing Executive Administration System.

Uses the app-factory pattern so the app can be instantiated with different
configs (development, production, testing) and so extensions are bound in a
single, well-defined place.
"""
from dotenv import load_dotenv
from flask import Flask

from app.config import get_config
from app.extensions import csrf, db, login_manager, migrate


def create_app(config_object=None):
    # Load .env before reading any configuration.
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    # Harden session cookies (Secure is only enforced in production/HTTPS).
    app.config.setdefault("SESSION_COOKIE_HTTPONLY", True)
    app.config.setdefault("SESSION_COOKIE_SAMESITE", "Lax")
    app.config.setdefault("SESSION_COOKIE_SECURE", not app.config.get("DEBUG", False))

    # Initialise extensions.
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "الرجاء تسجيل الدخول للوصول إلى هذه الصفحة."

    # Import models so they are registered on the metadata (needed for
    # migrations and for `flask shell` convenience).
    from app import models  # noqa: F401

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(models.User, int(user_id))

    # Register blueprints.
    from app.blueprints.main import main_bp
    from app.blueprints.auth import auth_bp
    from app.blueprints.staff import staff_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(staff_bp)

    # Register CLI commands.
    from app.commands import register_commands
    register_commands(app)

    return app
