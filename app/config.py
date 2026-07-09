"""Application configuration.

Configuration is driven entirely by environment variables (loaded from a local
``.env`` file in development via python-dotenv) so that no secret or
environment-specific value is ever hard-coded. Select a config class through
the ``FLASK_ENV`` variable; the app factory resolves it automatically.
"""

import os

from sqlalchemy.pool import StaticPool


class BaseConfig:
    """Settings shared by every environment."""

    # SECRET_KEY protects sessions/CSRF. Must be overridden in production.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-insecure-change-me")

    # SQLAlchemy: default to a local SQLite file for zero-setup development.
    # In production, set DATABASE_URL to a PostgreSQL URL (models are written
    # to stay Postgres-compatible).
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///nursing.sqlite3"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Organisation display name, surfaced in templates.
    ORG_NAME_AR = "مستشفى جازان التخصصي"
    APP_NAME_AR = "نظام إدارة التمريض التنفيذي"


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class ProductionConfig(BaseConfig):
    DEBUG = False

    def __init__(self):
        # Fail fast if a real secret was not supplied in production.
        if self.SECRET_KEY in (
            None,
            "",
            "dev-insecure-change-me",
            "change-me-in-production",
        ):
            raise RuntimeError(
                "SECRET_KEY must be set to a secure value in production."
            )


class TestingConfig(BaseConfig):
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    # A single shared connection so the in-memory DB persists across requests
    # within a test (default pooling would give each connection a fresh DB).
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    }
    # Disable CSRF for most tests; the dedicated CSRF test re-enables it.
    WTF_CSRF_ENABLED = False
    SECRET_KEY = "testing-secret-key"


_CONFIG_BY_ENV = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}


def get_config():
    """Return the config class matching FLASK_ENV (defaults to development)."""
    env = os.environ.get("FLASK_ENV", "development").lower()
    return _CONFIG_BY_ENV.get(env, DevelopmentConfig)
