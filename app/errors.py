"""Branded error handlers (403 / 404 / 500), localised and direction-aware."""

from flask import render_template
from flask_babel import lazy_gettext as _l

from app.extensions import db

_PAGES = {
    403: (_l("غير مصرّح"), _l("ليس لديك صلاحية الوصول إلى هذه الصفحة.")),
    404: (_l("الصفحة غير موجودة"), _l("تعذّر العثور على الصفحة المطلوبة.")),
    500: (
        _l("خطأ في الخادم"),
        _l("حدث خطأ غير متوقع. تم تسجيل المشكلة وسنعمل على معالجتها."),
    ),
}


def _render(code):
    title, message = _PAGES[code]
    return render_template(
        "errors/error.html", code=code, title=title, message=message
    ), code


def register_error_handlers(app):
    @app.errorhandler(403)
    def forbidden(e):
        return _render(403)

    @app.errorhandler(404)
    def not_found(e):
        return _render(404)

    @app.errorhandler(500)
    def server_error(e):
        # Roll back any half-applied transaction before rendering.
        db.session.rollback()
        app.logger.exception("Unhandled server error")
        return _render(500)
