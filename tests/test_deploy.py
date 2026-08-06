"""Production-readiness tests: health check and error pages."""

from tests.conftest import NURSE_EMAIL, login


def test_healthz_ok_without_auth(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_404_uses_branded_page(client):
    r = client.get("/no-such-page")
    assert r.status_code == 404
    body = r.get_data(as_text=True)
    assert "404" in body
    assert "الصفحة غير موجودة" in body


def test_403_uses_branded_page(client):
    # A staff nurse hitting a manage-only route triggers the 403 handler.
    login(client, NURSE_EMAIL)
    r = client.get("/staff/")
    assert r.status_code == 403
    assert "غير مصرّح" in r.get_data(as_text=True)
