"""Staff database tests."""
from app.models import Staff
from tests.conftest import NURSE_EMAIL, login


def test_list_requires_manage_role(client):
    login(client, NURSE_EMAIL)
    assert client.get("/staff/").status_code == 403


def test_list_shows_seeded_staff(client):
    login(client)
    body = client.get("/staff/").get_data(as_text=True)
    assert "سارة علي" in body


def test_create_staff(client, app):
    login(client)
    r = client.post("/staff/new", data={
        "name": "نورة عبدالله", "employee_id": "EMP-2001",
        "role": "staff_nurse", "department_id": _first_dept_id(),
        "email": "n@jazanhospital.com", "is_active": "y",
    }, follow_redirects=False)
    assert r.status_code == 302
    assert Staff.query.filter_by(employee_id="EMP-2001").first() is not None


def test_duplicate_employee_id_rejected(client):
    login(client)
    r = client.post("/staff/new", data={
        "name": "مكرر", "employee_id": "EMP-1001",
        "role": "staff_nurse", "department_id": _first_dept_id(),
    })
    assert r.status_code == 200
    assert "مستخدم بالفعل" in r.get_data(as_text=True)


def test_search_by_employee_id(client):
    login(client)
    body = client.get("/staff/?q=EMP-1002").get_data(as_text=True)
    assert "محمد حسن" in body
    assert "سارة علي" not in body


def test_filter_by_department(client):
    login(client)
    from app.models import Department
    icu = Department.query.filter_by(name="العناية المركزة").first()
    body = client.get(f"/staff/?department_id={icu.id}").get_data(as_text=True)
    assert "سارة علي" in body  # ICU nurse
    assert "محمد حسن" not in body  # ER nurse


def test_delete_staff(client, app):
    login(client)
    sid = Staff.query.filter_by(employee_id="EMP-1002").first().id
    client.post(f"/staff/{sid}/delete", follow_redirects=False)
    assert Staff.query.get(sid) is None


def _first_dept_id():
    from app.models import Department
    return Department.query.order_by(Department.name).first().id
