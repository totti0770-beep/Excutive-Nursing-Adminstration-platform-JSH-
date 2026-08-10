"""Auth forms (Flask-WTF, includes CSRF protection)."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, StringField
from wtforms.validators import DataRequired, Email, EqualTo, Length


class LoginForm(FlaskForm):
    email = StringField(
        _l("البريد الإلكتروني"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال البريد الإلكتروني")),
            Email(message=_l("بريد إلكتروني غير صالح")),
        ],
    )
    password = PasswordField(
        _l("كلمة المرور"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال كلمة المرور")),
            Length(min=1),
        ],
    )
    remember = BooleanField(_l("تذكرني"))


class PasswordChangeForm(FlaskForm):
    current_password = PasswordField(
        _l("كلمة المرور الحالية"),
        validators=[DataRequired(message=_l("الرجاء إدخال كلمة المرور الحالية"))],
    )
    new_password = PasswordField(
        _l("كلمة المرور الجديدة"),
        validators=[
            # Strength is checked in the route via
            # app.security.validate_password_strength, which also knows the
            # user's email — keeping the policy in exactly one place.
            DataRequired(message=_l("الرجاء إدخال كلمة المرور الجديدة")),
        ],
    )
    confirm = PasswordField(
        _l("تأكيد كلمة المرور"),
        validators=[
            DataRequired(message=_l("الرجاء تأكيد كلمة المرور")),
            EqualTo("new_password", message=_l("كلمتا المرور غير متطابقتين")),
        ],
    )
