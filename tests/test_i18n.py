"""Localisation: Arabic (RTL) default, English (LTR) available.

These tests deliberately use their own fixture rather than the shared ``app``
one. The shared fixture holds a single application context open for the whole
test, and Flask-Babel caches the resolved locale on the application context —
so every request in a test would reuse the locale resolved by the first one,
and a language switch would appear not to work. In production each request
gets a fresh application context, so the fixture below (which pushes a context
only for setup and teardown) is the faithful arrangement.
"""

import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db as _db
from tests.conftest import ADMIN_EMAIL, PASSWORD, _seed


@pytest.fixture
def app():
    """App whose requests each get their own application context."""
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        _seed()
    yield app
    with app.app_context():
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def _html(response):
    return response.get_data(as_text=True)


def switch(client, locale, next_path="/login"):
    return client.post(f"/lang/{locale}", data={"next": next_path})


# --- defaults ------------------------------------------------------------


def test_default_locale_is_arabic_rtl(client):
    html = _html(client.get("/login"))
    assert 'lang="ar"' in html
    assert 'dir="rtl"' in html
    assert "تسجيل الدخول" in html


def test_arabic_is_served_without_a_catalog(client):
    """Arabic text comes from the message ids themselves, not a translation."""
    html = _html(client.get("/login"))
    # The organisation name is defined in config and wrapped in lazy gettext;
    # with no Arabic catalog it must still render as Arabic.
    assert "مستشفى جازان التخصصي" in html


# --- switching -----------------------------------------------------------


def test_switch_to_english_flips_direction_and_copy(client):
    switch(client, "en")
    html = _html(client.get("/login"))
    assert 'lang="en"' in html
    assert 'dir="ltr"' in html
    assert "Sign in" in html
    assert "Jazan Specialty Hospital" in html


def test_switch_back_to_arabic(client):
    switch(client, "en")
    assert 'dir="ltr"' in _html(client.get("/login"))
    switch(client, "ar")
    html = _html(client.get("/login"))
    assert 'dir="rtl"' in html
    assert "تسجيل الدخول" in html


def test_switcher_offers_the_other_language_in_its_own_script(client):
    # While in Arabic the control reads "English"; while in English, "العربية".
    assert "English" in _html(client.get("/login"))
    switch(client, "en")
    assert "العربية" in _html(client.get("/login"))


def test_anonymous_visitor_can_switch_on_the_login_page(client):
    """Language must be changeable before signing in."""
    assert switch(client, "en").status_code in (301, 302)
    assert "Sign in" in _html(client.get("/login"))


def test_unsupported_locale_is_rejected(client):
    assert client.post("/lang/de", data={}).status_code == 404
    assert client.post("/lang/../etc", data={}).status_code == 404


def test_switch_requires_post(client):
    """A GET must not change state (it would be triggerable by a link)."""
    assert client.get("/lang/en").status_code == 405


# --- redirect safety -----------------------------------------------------


def test_switch_does_not_follow_an_external_next(client):
    resp = client.post("/lang/en", data={"next": "http://evil.example.com/"})
    assert resp.status_code in (301, 302)
    assert "evil.example.com" not in resp.headers["Location"]


def test_switch_returns_to_the_originating_page(client):
    resp = client.post("/lang/en", data={"next": "/login"})
    assert resp.headers["Location"].endswith("/login")


# --- persistence ---------------------------------------------------------


def test_preference_persists_to_the_account(app, client):
    """A signed-in user's choice is stored and reused in a brand-new session."""
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    switch(client, "en", next_path="/")

    with app.app_context():
        from app.models import User

        assert User.query.filter_by(email=ADMIN_EMAIL).first().locale == "en"

    # A fresh client has no session locale, so the stored preference decides.
    fresh = app.test_client()
    fresh.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    assert 'dir="ltr"' in _html(fresh.get("/"))


def test_anonymous_choice_is_not_written_to_any_account(app, client):
    switch(client, "en")
    with app.app_context():
        from app.models import User

        assert User.query.filter_by(email=ADMIN_EMAIL).first().locale is None


# --- content negotiation -------------------------------------------------


def test_accept_language_header_is_honoured(client):
    html = _html(client.get("/login", headers={"Accept-Language": "en-GB,en;q=0.9"}))
    assert 'dir="ltr"' in html


def test_explicit_choice_overrides_accept_language(client):
    switch(client, "ar")
    html = _html(client.get("/login", headers={"Accept-Language": "en-GB,en;q=0.9"}))
    assert 'dir="rtl"' in html


def test_unknown_accept_language_falls_back_to_arabic(client):
    html = _html(client.get("/login", headers={"Accept-Language": "de-DE,de;q=0.9"}))
    assert 'dir="rtl"' in html


# --- coverage of every translated page ------------------------------------


ALL_PAGES = [
    "/",
    "/me",
    "/account/password",
    "/staff/",
    "/staff/new",
    "/departments/",
    "/departments/new",
    "/recognition/",
    "/recognition/new",
    "/performance/",
    "/performance/new",
    "/news/",
    "/news/new",
    "/users/",
    "/users/new",
    "/audit/",
]


@pytest.mark.parametrize("path", ALL_PAGES)
def test_pages_render_in_both_locales(client, path):
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    for locale, direction in (("ar", "rtl"), ("en", "ltr")):
        client.post(f"/lang/{locale}", data={"next": path})
        resp = client.get(path)
        assert resp.status_code == 200, f"{path} failed in {locale}"
        assert f'dir="{direction}"' in _html(resp)


def test_english_pages_are_actually_translated(client):
    """Guards against a page rendering English chrome around Arabic content."""
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    client.post("/lang/en", data={"next": "/staff/"})
    for path, expected in (
        ("/staff/", "Nursing staff database"),
        ("/departments/", "Nursing administration departments"),
        ("/users/", "User accounts"),
        ("/audit/", "Audit trail"),
        ("/performance/", "Performance metrics"),
        ("/recognition/", "Recognition & awards"),
    ):
        assert expected in _html(client.get(path)), f"{path} not translated"


# --- stored vocabularies must not follow the interface language ------------
#
# Award types and metric names are written to the database verbatim. If the
# English UI submitted the translated label, rows would fragment by the
# author's language and the filters would stop matching across languages.


def test_award_created_in_english_stores_the_canonical_arabic_value(app, client):
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    client.post("/lang/en", data={"next": "/recognition/"})

    # The English form must still offer the canonical value as the option value.
    form_html = _html(client.get("/recognition/new"))
    assert 'value="ممرض/ممرضة الشهر"' in form_html
    assert "Nurse of the Month" in form_html  # ...displayed in English

    with app.app_context():
        from app.models import Staff

        staff_id = Staff.query.order_by(Staff.name).first().id

    client.post(
        "/recognition/new",
        data={
            "staff_id": staff_id,
            "award_type": "ممرض/ممرضة الشهر",
            "granted_by": "admin",
        },
    )

    with app.app_context():
        from app.models import Recognition

        stored = [r.award_type for r in Recognition.query.all()]
        assert "Nurse of the Month" not in stored
        assert "ممرض/ممرضة الشهر" in stored

    # ...and the filter still matches it while the UI is in English.
    filtered = _html(client.get("/recognition/?award_type=ممرض/ممرضة الشهر"))
    assert "Nurse of the Month" in filtered


def test_metric_recorded_in_english_stores_the_canonical_arabic_value(app, client):
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    client.post("/lang/en", data={"next": "/performance/"})

    with app.app_context():
        from app.models import Staff

        staff_id = Staff.query.order_by(Staff.name).first().id

    client.post(
        "/performance/new",
        data={"staff_id": staff_id, "metric_name": "جودة الرعاية", "value": "88"},
    )

    with app.app_context():
        from app.models import Performance

        stored = [p.metric_name for p in Performance.query.all()]
        assert "Quality of care" not in stored
        assert "جودة الرعاية" in stored


def test_role_is_stored_as_its_key_not_its_label(app, client):
    """Role labels are localised; the stored role value must not be."""
    client.post("/login", data={"email": ADMIN_EMAIL, "password": PASSWORD})
    client.post("/lang/en", data={"next": "/users/"})
    client.post(
        "/users/new",
        data={
            "email": "newperson@jazanhospital.com",
            "password": "StrongPass123",
            "role": "nursing_director",
            "staff_id": 0,
            "is_active": "y",
        },
    )
    with app.app_context():
        from app.models import User

        created = User.query.filter_by(email="newperson@jazanhospital.com").first()
        assert created is not None
        assert created.role == "nursing_director"
