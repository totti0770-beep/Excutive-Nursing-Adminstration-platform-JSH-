"""Role-based landing / dashboard access tests."""

from tests.conftest import HEAD_EMAIL, NURSE_EMAIL, login


def test_nurse_redirected_from_dashboard_to_my_home(client):
    login(client, NURSE_EMAIL)
    r = client.get("/", follow_redirects=False)
    assert r.status_code == 302
    assert r.headers["Location"].endswith("/me")


def test_linked_nurse_sees_profile_and_awards(client):
    login(client, NURSE_EMAIL)
    body = client.get("/me").get_data(as_text=True)
    assert "سارة علي" in body  # linked staff name
    assert "شكر وتقدير" in body  # their seeded award


def test_admin_sees_dashboard(client):
    login(client)
    body = client.get("/").get_data(as_text=True)
    assert "نظرة عامة تنفيذية" in body


def test_department_head_sees_dashboard(client):
    login(client, HEAD_EMAIL)
    r = client.get("/", follow_redirects=False)
    assert r.status_code == 200
    assert "نظرة عامة تنفيذية" in r.get_data(as_text=True)


def test_unlinked_user_gets_graceful_my_home(client, app):
    """A user with no staff_id still gets a usable landing page."""
    from app.extensions import db
    from app.models import User
    from app.security import Roles

    u = User(email="solo@jazanhospital.com", role=Roles.STAFF_NURSE)
    u.set_password("StrongPass123")
    db.session.add(u)
    db.session.commit()

    login(client, "solo@jazanhospital.com")
    body = client.get("/me").get_data(as_text=True)
    assert "لم يتم ربط حسابك" in body
