"""User (login account) add/edit form."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, SelectField, StringField
from wtforms.validators import DataRequired, Email, Length, Optional

from app.security import Roles


class UserForm(FlaskForm):
    email = StringField(
        _l("البريد الإلكتروني"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال البريد الإلكتروني")),
            Email(message=_l("بريد إلكتروني غير صالح")),
            Length(max=255),
        ],
    )
    role = SelectField(
        _l("الدور"),
        choices=[(r, Roles.label(r)) for r in Roles.ALL],
        validators=[DataRequired(message=_l("الرجاء اختيار الدور"))],
    )
    # 0 == not linked; real staff ids populated per-request in the route.
    staff_id = SelectField(
        _l("ملف الموظف المرتبط"), coerce=int, validators=[Optional()]
    )
    # Required on create, optional on edit (blank = keep current password);
    # length is validated in the route where we know the mode.
    password = PasswordField(_l("كلمة المرور"), validators=[Optional()])
    is_active = BooleanField(_l("نشط"), default=True)
