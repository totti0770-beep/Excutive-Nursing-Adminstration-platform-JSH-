"""Departments tests."""

from app.models import Department
from tests.conftest import NURSE_EMAIL, login


def test_list_requires_manage_role(client):
    login(client, NURSE_EMAIL)
    assert client.get("/departments/").status_code == 403


def test_create_department(client, app):
    login(client)
    before = Department.query.count()
    r = client.post(
        "/departments/new",
        data={
            "name": "قسم جديد",
            "location": "C-1",
            "head_name": "د. أحمد",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    assert Department.query.count() == before + 1


def test_duplicate_name_rejected(client):
    login(client)
    r = client.post("/departments/new", data={"name": "العناية المركزة"})
    assert r.status_code == 200
    assert "مستخدم بالفعل" in r.get_data(as_text=True)


def test_detail_shows_real_roster(client, app):
    login(client)
    icu = Department.query.filter_by(name="العناية المركزة").first()
    body = client.get(f"/departments/{icu.id}").get_data(as_text=True)
    assert "سارة علي" in body  # ICU staff from seed


def test_delete_blocked_while_staff_assigned(client, app):
    login(client)
    icu = Department.query.filter_by(name="العناية المركزة").first()
    r = client.post(f"/departments/{icu.id}/delete", follow_redirects=True)
    assert "لا يمكن حذف قسم" in r.get_data(as_text=True)
    assert Department.query.get(icu.id) is not None


def test_empty_department_can_be_deleted(client, app):
    login(client)
    d = Department(name="فارغ")
    from app.extensions import db

    db.session.add(d)
    db.session.commit()
    did = d.id
    client.post(f"/departments/{did}/delete", follow_redirects=False)
    assert Department.query.get(did) is None
