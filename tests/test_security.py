"""Security & compliance tests: audit log, deactivation, password change,
security headers, and login rate limiting."""

from app.extensions import db
from app.models import AuditLog, Staff, User
from tests.conftest import ADMIN_EMAIL, NURSE_EMAIL, PASSWORD, login

# --- Audit logging -------------------------------------------------------


def test_login_is_audited(client):
    login(client)
    entry = AuditLog.query.filter_by(action="login").first()
    assert entry is not None and entry.user_email == ADMIN_EMAIL


def test_failed_login_is_audited(client):
    client.post("/login", data={"email": ADMIN_EMAIL, "password": "WRONG"})
    assert AuditLog.query.filter_by(action="login_failed").first() is not None


def test_create_and_delete_are_audited(client, app):
    login(client)
    dept_id = Staff.query.first().department_id
    client.post(
        "/staff/new",
        data={
            "name": "مدقق",
            "employee_id": "EMP-9100",
            "role": "staff_nurse",
            "department_id": dept_id,
            "is_active": "y",
        },
    )
    created = AuditLog.query.filter_by(action="create", entity_type="staff").first()
    assert created is not None

    sid = Staff.query.filter_by(employee_id="EMP-9100").first().id
    client.post(f"/staff/{sid}/delete")
    assert (
        AuditLog.query.filter_by(action="delete", entity_type="staff").first()
        is not None
    )


def test_audit_viewer_is_system_admin_only(client):
    from tests.conftest import HEAD_EMAIL

    login(client, HEAD_EMAIL)
    assert client.get("/audit/").status_code == 403


def test_audit_viewer_lists_entries(client):
    login(client)  # generates a "login" audit row
    body = client.get("/audit/").get_data(as_text=True)
    assert "سجل التدقيق" in body
    assert "login" in body


# --- Immediate deactivation ---------------------------------------------


def test_deactivated_user_is_logged_out_on_next_request(client, app):
    login(client, NURSE_EMAIL)
    assert client.get("/me").status_code == 200
    # Deactivate the account out-of-band...
    nurse = User.query.filter_by(email=NURSE_EMAIL).first()
    nurse.is_active = False
    db.session.commit()
    # ...next request is no longer authenticated -> redirect to login.
    r = client.get("/me", follow_redirects=False)
    assert r.status_code == 302 and "/login" in r.headers["Location"]


# --- Self-service password change ---------------------------------------


def test_password_change_success(client, app):
    login(client, NURSE_EMAIL)
    r = client.post(
        "/account/password",
        data={
            "current_password": PASSWORD,
            "new_password": "BrandNewPass1",
            "confirm": "BrandNewPass1",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    nurse = User.query.filter_by(email=NURSE_EMAIL).first()
    assert nurse.check_password("BrandNewPass1")


def test_password_change_wrong_current_rejected(client):
    login(client, NURSE_EMAIL)
    r = client.post(
        "/account/password",
        data={
            "current_password": "WRONG",
            "new_password": "BrandNewPass1",
            "confirm": "BrandNewPass1",
        },
    )
    assert r.status_code == 200
    assert "كلمة المرور الحالية غير صحيحة" in r.get_data(as_text=True)


def test_password_change_mismatch_rejected(client):
    login(client, NURSE_EMAIL)
    r = client.post(
        "/account/password",
        data={
            "current_password": PASSWORD,
            "new_password": "BrandNewPass1",
            "confirm": "Different1",
        },
    )
    assert r.status_code == 200
    assert "غير متطابقتين" in r.get_data(as_text=True)


# --- Security headers ----------------------------------------------------


def test_security_headers_present(client):
    login(client)
    r = client.get("/")
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert "default-src 'self'" in r.headers.get("Content-Security-Policy", "")


# --- Login rate limiting -------------------------------------------------


def test_login_rate_limited():
    """With rate limiting on, repeated login POSTs eventually get 429."""
    from app import create_app
    from app.config import TestingConfig

    class RateLimitedConfig(TestingConfig):
        RATELIMIT_ENABLED = True

    app = create_app(RateLimitedConfig)
    with app.app_context():
        db.create_all()
        c = app.test_client()
        statuses = [
            c.post(
                "/login", data={"email": "x@jazanhospital.com", "password": "nope"}
            ).status_code
            for _ in range(12)
        ]
        assert 429 in statuses
        db.drop_all()
