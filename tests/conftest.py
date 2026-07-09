"""Shared pytest fixtures.

Builds the app on an isolated in-memory SQLite database (see TestingConfig),
creates the schema, and seeds a small, predictable data set plus one user per
role so tests can exercise RBAC.
"""
from datetime import date

import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db as _db
from app.models import Department, Recognition, Staff, User
from app.security import Roles

# Well-known credentials used across tests.
ADMIN_EMAIL = "admin@jazanhospital.com"
NURSE_EMAIL = "nurse@jazanhospital.com"
HEAD_EMAIL = "head@jazanhospital.com"
PASSWORD = "StrongPass123"


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        _seed()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def _seed():
    icu = Department(name="العناية المركزة", location="A-3")
    er = Department(name="الطوارئ", location="B-0")
    _db.session.add_all([icu, er])
    _db.session.flush()

    s1 = Staff(name="سارة علي", employee_id="EMP-1001",
               role=Roles.STAFF_NURSE, department=icu, is_active=True)
    s2 = Staff(name="محمد حسن", employee_id="EMP-1002",
               role=Roles.STAFF_NURSE, department=er, is_active=True,
               hire_date=date(2024, 1, 1))
    _db.session.add_all([s1, s2])
    _db.session.flush()

    _db.session.add(Recognition(staff_id=s1.id, award_type="شكر وتقدير",
                                granted_by="admin"))

    admin = User(email=ADMIN_EMAIL, role=Roles.SYSTEM_ADMIN)
    admin.set_password(PASSWORD)
    # Nurse linked to a staff profile.
    nurse = User(email=NURSE_EMAIL, role=Roles.STAFF_NURSE, staff_id=s1.id)
    nurse.set_password(PASSWORD)
    head = User(email=HEAD_EMAIL, role=Roles.DEPARTMENT_HEAD)
    head.set_password(PASSWORD)
    _db.session.add_all([admin, nurse, head])
    _db.session.commit()


def login(client, email=ADMIN_EMAIL, password=PASSWORD):
    """Log a client in (CSRF is disabled in TestingConfig)."""
    return client.post("/login", data={"email": email, "password": password},
                       follow_redirects=False)
