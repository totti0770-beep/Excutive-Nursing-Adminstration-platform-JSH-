"""Announcement create/edit form."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import BooleanField, SelectField, StringField, TextAreaField
from wtforms.validators import DataRequired, Length

from app.blueprints.news import CATEGORIES


class AnnouncementForm(FlaskForm):
    title = StringField(
        _l("العنوان"),
        validators=[DataRequired(message=_l("الرجاء إدخال العنوان")), Length(max=200)],
    )
    category = SelectField(
        _l("التصنيف"),
        choices=[(k, v) for k, v in CATEGORIES.items()],
        validators=[DataRequired(message=_l("الرجاء اختيار التصنيف"))],
    )
    body = TextAreaField(
        _l("المحتوى"),
        validators=[DataRequired(message=_l("الرجاء إدخال المحتوى"))],
    )
    is_published = BooleanField(_l("منشور"), default=True)
    pinned = BooleanField(_l("مثبّت"))
