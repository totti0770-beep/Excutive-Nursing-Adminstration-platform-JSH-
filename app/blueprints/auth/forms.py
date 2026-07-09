"""Auth forms (Flask-WTF, includes CSRF protection)."""

from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, StringField
from wtforms.validators import DataRequired, Email, EqualTo, Length


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


class PasswordChangeForm(FlaskForm):
    current_password = PasswordField(
        "كلمة المرور الحالية",
        validators=[DataRequired(message="الرجاء إدخال كلمة المرور الحالية")],
    )
    new_password = PasswordField(
        "كلمة المرور الجديدة",
        validators=[
            DataRequired(message="الرجاء إدخال كلمة المرور الجديدة"),
            Length(min=8, message="كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
        ],
    )
    confirm = PasswordField(
        "تأكيد كلمة المرور",
        validators=[
            DataRequired(message="الرجاء تأكيد كلمة المرور"),
            EqualTo("new_password", message="كلمتا المرور غير متطابقتين"),
        ],
    )
