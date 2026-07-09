"""Auth forms (Flask-WTF, includes CSRF protection)."""

from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, StringField
from wtforms.validators import DataRequired, Email, Length


class LoginForm(FlaskForm):
    email = StringField(
        "البريد الإلكتروني",
        validators=[
            DataRequired(message="الرجاء إدخال البريد الإلكتروني"),
            Email(message="بريد إلكتروني غير صالح"),
        ],
    )
    password = PasswordField(
        "كلمة المرور",
        validators=[DataRequired(message="الرجاء إدخال كلمة المرور"), Length(min=1)],
    )
    remember = BooleanField("تذكرني")
