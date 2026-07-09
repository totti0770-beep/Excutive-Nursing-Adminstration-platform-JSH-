"""Recognition (Awards) tests."""

from app.models import Recognition, Staff
from tests.conftest import NURSE_EMAIL, login


def test_list_requires_manage_role(client):
    login(client, NURSE_EMAIL)
    assert client.get("/recognition/").status_code == 403


def test_assign_award(client, app):
    login(client)
    sid = Staff.query.first().id
    before = Recognition.query.count()
    r = client.post(
        "/recognition/new",
        data={
            "staff_id": sid,
            "award_type": "ممرض/ممرضة الشهر",
            "granted_by": "لجنة",
            "awarded_on": "2026-07-01",
            "note": "متميز",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    assert Recognition.query.count() == before + 1


def test_filter_by_award_type(client):
    login(client)
    # Seed data has one "شكر وتقدير" award; the award row shows its type text.
    body = client.get("/recognition/?award_type=شكر وتقدير").get_data(as_text=True)
    assert "شكر وتقدير" in body
    # Filtering to a type with no awards yields the empty-list state (the
    # "top recipients" side panel still lists names, so assert on the list).
    body2 = client.get("/recognition/?award_type=روح الفريق").get_data(as_text=True)
    assert "لا توجد تكريمات بعد" in body2


def test_delete_recognition(client, app):
    login(client)
    rid = Recognition.query.first().id
    client.post(f"/recognition/{rid}/delete", follow_redirects=False)
    assert Recognition.query.get(rid) is None
