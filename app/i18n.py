"""Localisation support (Arabic RTL / English LTR).

Arabic is the primary language: the source strings in templates and forms are
Arabic, so an Arabic message id *is* the Arabic text. That means an untranslated
or missing catalog entry falls back to correct Arabic rather than to a key —
the shipped Arabic interface cannot regress because of a translation gap.
English is supplied as a catalog under ``translations/en/``.

Locale resolution order (first match wins):

1. an explicit choice stored in the session (set via ``/lang/<locale>``)
2. the signed-in user's saved preference (``users.locale``)
3. the browser's ``Accept-Language`` header
4. ``BABEL_DEFAULT_LOCALE`` (Arabic)
"""

from flask import current_app, request, session
from flask_login import current_user

# Session key holding an explicit per-visitor language choice.
SESSION_KEY = "locale"

# Locales whose script runs right-to-left.
_RTL_LOCALES = {"ar"}


def supported_locales():
    """Locale codes this application ships, in display order."""
    return current_app.config.get("LANGUAGES", ["ar"])


def is_supported(locale):
    return locale in supported_locales()


def select_locale():
    """Resolve the locale for the current request (Flask-Babel selector)."""
    chosen = session.get(SESSION_KEY)
    if is_supported(chosen):
        return chosen

    # A signed-in user's saved preference survives new sessions and devices.
    if current_user.is_authenticated:
        preferred = getattr(current_user, "locale", None)
        if is_supported(preferred):
            return preferred

    # Fall back to the browser's preference, then to the configured default.
    if request:
        best = request.accept_languages.best_match(supported_locales())
        if best:
            return best

    return current_app.config.get("BABEL_DEFAULT_LOCALE", "ar")


def is_rtl(locale):
    """True when the given locale is written right-to-left."""
    return str(locale).split("_")[0].split("-")[0] in _RTL_LOCALES


def text_direction(locale):
    """The HTML ``dir`` attribute value for a locale."""
    return "rtl" if is_rtl(locale) else "ltr"
