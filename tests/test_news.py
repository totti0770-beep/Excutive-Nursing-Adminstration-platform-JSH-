"""News / announcements tests."""

from app.models import Announcement
from tests.conftest import NURSE_EMAIL, login


def test_feed_visible_to_any_authenticated_user(client):
    login(client, NURSE_EMAIL)
    assert client.get("/news/").status_code == 200


def test_create_is_admin_only(client):
    login(client, NURSE_EMAIL)
    assert client.get("/news/new").status_code == 403


def test_admin_can_create_announcement(client, app):
    login(client)
    r = client.post(
        "/news/new",
        data={
            "title": "تعميم",
            "category": "announcement",
            "body": "نص التعميم",
            "is_published": "y",
        },
        follow_redirects=False,
    )
    assert r.status_code == 302
    assert Announcement.query.filter_by(title="تعميم").first() is not None


def test_pinned_sorts_first(client, app):
    login(client)
    client.post(
        "/news/new",
        data={"title": "قديم", "category": "news", "body": "x", "is_published": "y"},
    )
    client.post(
        "/news/new",
        data={
            "title": "مثبت",
            "category": "news",
            "body": "y",
            "is_published": "y",
            "pinned": "y",
        },
    )
    body = client.get("/news/").get_data(as_text=True)
    assert body.index("مثبت") < body.index("قديم")


def test_category_filter(client, app):
    login(client)
    client.post(
        "/news/new",
        data={
            "title": "فعالية اليوم",
            "category": "event",
            "body": "z",
            "is_published": "y",
        },
    )
    body = client.get("/news/?category=event").get_data(as_text=True)
    assert "فعالية اليوم" in body
    body2 = client.get("/news/?category=news").get_data(as_text=True)
    assert "فعالية اليوم" not in body2
