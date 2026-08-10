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


# --- Account lockout -----------------------------------------------------
#
# Per-account lockout complements the per-IP rate limit: without it, an
# attacker spread across many IPs gets unlimited attempts on one account.


def _fail_login(client, times, email=ADMIN_EMAIL):
    for _ in range(times):
        client.post("/login", data={"email": email, "password": "WRONG"})


def test_account_locks_after_repeated_failures(client, app):
    limit = app.config["LOGIN_MAX_FAILED_ATTEMPTS"]
    _fail_login(client, limit)

    user = User.query.filter_by(email=ADMIN_EMAIL).first()
    assert user.failed_login_count >= limit
    assert user.is_locked


def test_locked_account_rejects_the_correct_password(client, app):
    """The whole point: knowing the password is not enough while locked."""
    _fail_login(client, app.config["LOGIN_MAX_FAILED_ATTEMPTS"])

    resp = client.post(
        "/login",
        data={"email": ADMIN_EMAIL, "password": PASSWORD},
        follow_redirects=False,
    )
    assert resp.status_code == 200  # re-rendered form, not a redirect to /
    assert AuditLog.query.filter_by(action="login_locked").first() is not None


def test_lockout_expires_on_its_own(client, app):
    """Locks lapse without an administrator, so nobody is stranded."""
    from datetime import datetime, timedelta

    _fail_login(client, app.config["LOGIN_MAX_FAILED_ATTEMPTS"])
    user = User.query.filter_by(email=ADMIN_EMAIL).first()
    user.locked_until = datetime.utcnow() - timedelta(minutes=1)
    db.session.commit()

    assert not user.is_locked
    resp = client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    assert resp.status_code == 302


def test_successful_login_resets_the_failure_counter(client, app):
    _fail_login(client, app.config["LOGIN_MAX_FAILED_ATTEMPTS"] - 1)
    assert User.query.filter_by(email=ADMIN_EMAIL).first().failed_login_count > 0

    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    user = User.query.filter_by(email=ADMIN_EMAIL).first()
    assert user.failed_login_count == 0
    assert user.locked_until is None


def test_locked_account_is_indistinguishable_from_an_unknown_email(client, app):
    """Lockout must not leak which addresses are real accounts.

    The bodies are not compared wholesale — the form legitimately echoes the
    submitted address back into the email field. What must match is the status
    and the message the visitor is shown.
    """
    _fail_login(client, app.config["LOGIN_MAX_FAILED_ATTEMPTS"])

    locked = client.post("/login", data={"email": ADMIN_EMAIL, "password": "WRONG"})
    unknown = client.post(
        "/login", data={"email": "nobody@jazanhospital.com", "password": "WRONG"}
    )

    assert locked.status_code == unknown.status_code
    message = "بيانات الدخول غير صحيحة"
    assert message in locked.get_data(as_text=True)
    assert message in unknown.get_data(as_text=True)
    # And nothing in the locked response hints at a lock.
    assert "مقفل" not in locked.get_data(as_text=True)


# --- Admin unlock --------------------------------------------------------


def test_admin_can_unlock_an_account(client, app):
    # Lock the *nurse*, not the admin: a locked admin cannot sign in to
    # perform the unlock, which is exactly why automatic expiry exists.
    _fail_login(client, app.config["LOGIN_MAX_FAILED_ATTEMPTS"], email=NURSE_EMAIL)
    locked = User.query.filter_by(email=NURSE_EMAIL).first()
    assert locked.is_locked
    locked_id = locked.id

    login(client)
    client.post(f"/users/{locked_id}/unlock")

    user = db.session.get(User, locked_id)
    assert not user.is_locked
    assert user.failed_login_count == 0
    assert AuditLog.query.filter_by(action="account_unlocked").first() is not None


def test_unlock_is_system_admin_only(client):
    login(client, email=NURSE_EMAIL)
    target = User.query.filter_by(email=ADMIN_EMAIL).first().id
    assert client.post(f"/users/{target}/unlock").status_code == 403


# --- Password policy -----------------------------------------------------


def test_password_policy_rejects_weak_change(client):
    login(client)
    resp = client.post(
        "/account/password",
        data={
            "current_password": PASSWORD,
            "new_password": "alllowercase",  # no digit, no upper, no symbol
            "confirm": "alllowercase",
        },
    )
    assert resp.status_code == 200  # re-rendered with errors, not redirected
    assert User.query.filter_by(email=ADMIN_EMAIL).first().check_password(PASSWORD)


def test_password_policy_rejects_weak_new_user(client):
    login(client)
    client.post(
        "/users/new",
        data={
            "email": "weak@jazanhospital.com",
            "password": "lowercaseonly",
            "role": "staff_nurse",
            "staff_id": 0,
            "is_active": "y",
        },
    )
    assert User.query.filter_by(email="weak@jazanhospital.com").first() is None


def test_password_may_not_contain_the_email(client):
    login(client)
    client.post(
        "/users/new",
        data={
            "email": "jsmith@jazanhospital.com",
            "password": "Jsmith12345",
            "role": "staff_nurse",
            "staff_id": 0,
            "is_active": "y",
        },
    )
    assert User.query.filter_by(email="jsmith@jazanhospital.com").first() is None


def test_blank_password_on_edit_keeps_the_current_one(client):
    """Regression: the policy must not fire on the 'keep current' path."""
    login(client)
    user = User.query.filter_by(email=NURSE_EMAIL).first()
    client.post(
        f"/users/{user.id}/edit",
        data={
            "email": NURSE_EMAIL,
            "password": "",
            "role": "staff_nurse",
            "staff_id": 0,
            "is_active": "y",
        },
    )
    assert User.query.filter_by(email=NURSE_EMAIL).first().check_password(PASSWORD)


# --- Rate-limit storage --------------------------------------------------


def test_rate_limit_storage_is_configurable():
    """Production must be able to point the limiter at a shared backend."""
    from app.config import TestingConfig

    assert TestingConfig.RATELIMIT_STORAGE_URI == "memory://"

    import os

    os.environ["RATELIMIT_STORAGE_URI"] = "redis://example.invalid:6379"
    try:
        import importlib

        from app import config as config_module

        importlib.reload(config_module)
        assert (
            config_module.BaseConfig.RATELIMIT_STORAGE_URI
            == "redis://example.invalid:6379"
        )
    finally:
        del os.environ["RATELIMIT_STORAGE_URI"]
        importlib.reload(config_module)
