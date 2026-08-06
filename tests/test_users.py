"""User management tests (System Admin only)."""

from app.models import Staff, User
from tests.conftest import ADMIN_EMAIL, HEAD_EMAIL, NURSE_EMAIL, login


def test_list_is_system_admin_only(client):
    # Nursing Director / Department Head are managers but NOT system admins.
    login(client, HEAD_EMAIL)
    assert client.get("/users/").status_code == 403


def test_nurse_cannot_access(client):
    login(client, NURSE_EMAIL)
    assert client.get("/users/").status_code == 403


def test_admin_can_list(client):
    login(client)
    body = client.get("/users/").get_data(as_text=True)
    assert ADMIN_EMAIL in body


def test_create_user_linked_to_staff(client, app):
    login(client)
    # EMP-1002 (محمد حسن) is not linked to any user in the seed.
    staff = Staff.query.filter_by(employee_id="EMP-1002").first()
    r = client.post(
        "/users/new",
        data={
            "email": "new@jazanhospital.com",
            "role": "staff_nurse",
            "staff_id": staff.id,
            "password": "StrongPass123",
            "is_active": "y",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    u = User.query.filter_by(email="new@jazanhospital.com").first()
    assert u is not None and u.staff_id == staff.id
    assert u.check_password("StrongPass123")


def test_linked_user_sees_profile_on_my_home(client, app):
    # Admin creates a login linked to a staff record...
    login(client)
    staff = Staff.query.filter_by(employee_id="EMP-1002").first()
    client.post(
        "/users/new",
        data={
            "email": "mh@jazanhospital.com",
            "role": "staff_nurse",
            "staff_id": staff.id,
            "password": "StrongPass123",
            "is_active": "y",
        },
    )
    # ...then that user logs in and sees the linked profile on /me.
    # (Reuse the same client with a logout in between so Flask-Login resets
    # its per-app-context cached user.)
    client.post("/logout")
    login(client, "mh@jazanhospital.com")
    body = client.get("/me").get_data(as_text=True)
    assert "محمد حسن" in body


def test_short_password_rejected(client):
    login(client)
    r = client.post(
        "/users/new",
        data={
            "email": "x@jazanhospital.com",
            "role": "staff_nurse",
            "staff_id": 0,
            "password": "short",
        },
    )
    assert r.status_code == 200
    assert "٨ أحرف على الأقل" in r.get_data(as_text=True)


def test_duplicate_email_rejected(client):
    login(client)
    r = client.post(
        "/users/new",
        data={
            "email": ADMIN_EMAIL,
            "role": "staff_nurse",
            "staff_id": 0,
            "password": "StrongPass123",
        },
    )
    assert r.status_code == 200
    assert "مستخدم بالفعل" in r.get_data(as_text=True)


def test_one_user_per_staff_enforced(client, app):
    login(client)
    # The seeded nurse is already linked to EMP-1001 (سارة علي).
    linked_staff = Staff.query.filter_by(employee_id="EMP-1001").first()
    r = client.post(
        "/users/new",
        data={
            "email": "second@jazanhospital.com",
            "role": "staff_nurse",
            "staff_id": linked_staff.id,
            "password": "StrongPass123",
        },
    )
    assert r.status_code == 200
    assert "مرتبط بحساب آخر" in r.get_data(as_text=True)


def test_edit_can_unlink_staff(client, app):
    login(client)
    nurse = User.query.filter_by(email=NURSE_EMAIL).first()
    assert nurse.staff_id is not None
    client.post(
        f"/users/{nurse.id}/edit",
        data={
            "email": NURSE_EMAIL,
            "role": "staff_nurse",
            "staff_id": 0,
            "password": "",
            "is_active": "y",
        },
        follow_redirects=False,
    )
    assert User.query.filter_by(email=NURSE_EMAIL).first().staff_id is None


def test_cannot_delete_own_account(client, app):
    login(client)
    admin = User.query.filter_by(email=ADMIN_EMAIL).first()
    r = client.post(f"/users/{admin.id}/delete", follow_redirects=True)
    assert "لا يمكنك حذف حسابك الحالي" in r.get_data(as_text=True)
    assert User.query.filter_by(email=ADMIN_EMAIL).first() is not None


def test_delete_other_user(client, app):
    login(client)
    head = User.query.filter_by(email=HEAD_EMAIL).first()
    hid = head.id
    client.post(f"/users/{hid}/delete", follow_redirects=False)
    assert User.query.get(hid) is None
