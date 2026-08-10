"""Shared Flask extension instances.

Kept in their own module (instead of app/__init__.py) to avoid circular
imports: models and blueprints import ``db`` from here, and the app factory
initialises these against the application in one place.
"""

from flask_babel import Babel
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_talisman import Talisman
from flask_wtf import CSRFProtect

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
csrf = CSRFProtect()
# Storage is not set here: Flask-Limiter reads RATELIMIT_STORAGE_URI from app
# config at init_app time, so production can point at a shared backend without
# a code change (the in-process default is per worker).
limiter = Limiter(key_func=get_remote_address)
talisman = Talisman()
babel = Babel()
