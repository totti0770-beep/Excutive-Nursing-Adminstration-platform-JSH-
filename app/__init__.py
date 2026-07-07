"""Application factory for the Nursing Executive Administration System.

Uses the app-factory pattern so the app can be instantiated with different
configs (development, production, testing) and so extensions are bound in a
single, well-defined place.
"""
from dotenv import load_dotenv
from flask import Flask

from app.config import get_config
from app.extensions import db, migrate


def create_app(config_object=None):
    # Load .env before reading any configuration.
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_object or get_config())

    # Initialise extensions.
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so they are registered on the metadata (needed for
    # migrations and for `flask shell` convenience).
    from app import models  # noqa: F401

    # Register blueprints.
    from app.blueprints.main import main_bp
    app.register_blueprint(main_bp)

    return app
