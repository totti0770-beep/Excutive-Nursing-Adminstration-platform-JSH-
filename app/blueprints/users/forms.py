"""User (login account) add/edit form."""

from flask_wtf import FlaskForm
from wtforms import BooleanField, PasswordField, SelectField, StringField
from wtforms.validators import DataRequired, Email, Length, Optional

from app.security import Roles


class UserForm(FlaskForm):
    email = StringField(
        "البريد الإلكتروني",
        validators=[
            DataRequired(message="الرجاء إدخال البريد الإلكتروني"),
            Email(message="بريد إلكتروني غير صالح"),
            Length(max=255),
        ],
    )
    role = SelectField(
        "الدور",
        choices=[(r, Roles.label(r)) for r in Roles.ALL],
        validators=[DataRequired(message="الرجاء اختيار الدور")],
    )
    # 0 == not linked; real staff ids populated per-request in the route.
    staff_id = SelectField("ملف الموظف المرتبط", coerce=int, validators=[Optional()])
    # Required on create, optional on edit (blank = keep current password);
    # length is validated in the route where we know the mode.
    password = PasswordField("كلمة المرور", validators=[Optional()])
    is_active = BooleanField("نشط", default=True)
