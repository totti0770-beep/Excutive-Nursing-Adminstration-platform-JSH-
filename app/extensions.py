"""Shared Flask extension instances.

Kept in their own module (instead of app/__init__.py) to avoid circular
imports: models and blueprints import ``db`` from here, and the app factory
initialises these against the application in one place.
"""

from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
csrf = CSRFProtect()
