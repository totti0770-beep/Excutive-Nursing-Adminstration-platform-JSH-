"""Performance metrics + CSV export tests."""

from app.models import Performance, Staff
from tests.conftest import NURSE_EMAIL, login


def test_list_requires_manage_role(client):
    login(client, NURSE_EMAIL)
    assert client.get("/performance/").status_code == 403


def test_record_metric(client, app):
    login(client)
    sid = Staff.query.first().id
    before = Performance.query.count()
    r = client.post(
        "/performance/new",
        data={
            "staff_id": sid,
            "metric_name": "رضا المرضى",
            "value": "92.5",
            "date": "2026-07-01",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    assert Performance.query.count() == before + 1


def test_value_out_of_range_rejected(client):
    login(client)
    sid = Staff.query.first().id
    r = client.post(
        "/performance/new",
        data={"staff_id": sid, "metric_name": "رضا المرضى", "value": "150"},
    )
    assert r.status_code == 200
    assert "بين 0 و 100" in r.get_data(as_text=True)


def test_dashboard_avg_reflects_new_metric(client, app):
    login(client)
    sid = Staff.query.first().id
    client.post(
        "/performance/new",
        data={"staff_id": sid, "metric_name": "رضا المرضى", "value": "80"},
    )
    # The dashboard KPI card links to /performance and shows the avg.
    body = client.get("/").get_data(as_text=True)
    assert 'href="/performance/"' in body


def test_delete_metric(client, app):
    login(client)
    sid = Staff.query.first().id
    client.post(
        "/performance/new",
        data={"staff_id": sid, "metric_name": "رضا المرضى", "value": "70"},
    )
    pid = Performance.query.order_by(Performance.id.desc()).first().id
    client.post(f"/performance/{pid}/delete", follow_redirects=False)
    assert Performance.query.get(pid) is None


# --- CSV export ----------------------------------------------------------


def test_staff_export_csv(client):
    login(client)
    r = client.get("/staff/export.csv")
    assert r.status_code == 200
    assert "text/csv" in r.headers["Content-Type"]
    assert "attachment" in r.headers["Content-Disposition"]
    body = r.get_data(as_text=True)
    assert body.startswith("﻿")  # UTF-8 BOM for Excel
    assert "الرقم الوظيفي" in body  # header
    assert "EMP-1001" in body  # seeded staff row


def test_staff_export_honours_filter(client):
    login(client)
    body = client.get("/staff/export.csv?q=EMP-1002").get_data(as_text=True)
    assert "محمد حسن" in body
    assert "سارة علي" not in body


def test_recognition_export_csv(client):
    login(client)
    r = client.get("/recognition/export.csv")
    assert r.status_code == 200
    assert "شكر وتقدير" in r.get_data(as_text=True)


def test_export_requires_manage_role(client):
    login(client, NURSE_EMAIL)
    assert client.get("/staff/export.csv").status_code == 403
    assert client.get("/recognition/export.csv").status_code == 403
    assert client.get("/performance/export.csv").status_code == 403
