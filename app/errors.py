"""Branded RTL error handlers (403 / 404 / 500)."""

from flask import render_template

from app.extensions import db

_PAGES = {
    403: ("غير مصرّح", "ليس لديك صلاحية الوصول إلى هذه الصفحة."),
    404: ("الصفحة غير موجودة", "تعذّر العثور على الصفحة المطلوبة."),
    500: ("خطأ في الخادم", "حدث خطأ غير متوقع. تم تسجيل المشكلة وسنعمل على معالجتها."),
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
