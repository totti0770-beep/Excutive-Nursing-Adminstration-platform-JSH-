"""Announcement create/edit form."""

from flask_wtf import FlaskForm
from wtforms import BooleanField, SelectField, StringField, TextAreaField
from wtforms.validators import DataRequired, Length

from app.blueprints.news import CATEGORIES


class AnnouncementForm(FlaskForm):
    title = StringField(
        "العنوان",
        validators=[DataRequired(message="الرجاء إدخال العنوان"), Length(max=200)],
    )
    category = SelectField(
        "التصنيف",
        choices=[(k, v) for k, v in CATEGORIES.items()],
        validators=[DataRequired(message="الرجاء اختيار التصنيف")],
    )
    body = TextAreaField(
        "المحتوى",
        validators=[DataRequired(message="الرجاء إدخال المحتوى")],
    )
    is_published = BooleanField("منشور", default=True)
    pinned = BooleanField("مثبّت")
