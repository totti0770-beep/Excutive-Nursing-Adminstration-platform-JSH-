"""Authentication and session tests."""

from tests.conftest import ADMIN_EMAIL, PASSWORD, login


def test_anonymous_redirected_to_login(client):
    r = client.get("/", follow_redirects=False)
    assert r.status_code == 302
    assert "/login" in r.headers["Location"]


def test_wrong_password_rejected(client):
    r = client.post("/login", data={"email": ADMIN_EMAIL, "password": "WRONG"})
    assert r.status_code == 200
    assert "بيانات الدخول غير صحيحة" in r.get_data(as_text=True)


def test_correct_login_reaches_dashboard(client):
    login(client)
    r = client.get("/")
    assert r.status_code == 200
    body = r.get_data(as_text=True)
    assert "نظرة عامة تنفيذية" in body
    assert ADMIN_EMAIL in body  # header shows the real user


def test_logout_clears_session(client):
    login(client)
    r = client.post("/logout", follow_redirects=False)
    assert r.status_code == 302
    assert "/login" in r.headers["Location"]
    assert client.get("/", follow_redirects=False).status_code == 302


def test_password_is_hashed(app):
    from app.models import User

    u = User.query.filter_by(email=ADMIN_EMAIL).first()
    assert u.password_hash != PASSWORD
    assert u.check_password(PASSWORD)


def test_csrf_enforced_when_enabled():
    """With CSRF on, a token-less POST is rejected (400)."""
    from app import create_app
    from app.config import TestingConfig
    from app.extensions import db

    class CsrfConfig(TestingConfig):
        WTF_CSRF_ENABLED = True

    app = create_app(CsrfConfig)
    with app.app_context():
        db.create_all()
        c = app.test_client()
        r = c.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
        assert r.status_code == 400
        db.drop_all()
