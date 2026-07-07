"""Staff add/edit form (Flask-WTF)."""
from flask_wtf import FlaskForm
from wtforms import (BooleanField, DateField, SelectField, StringField)
from wtforms.validators import DataRequired, Email, Length, Optional

from app.security import Roles


class StaffForm(FlaskForm):
    name = StringField(
        "الاسم",
        validators=[DataRequired(message="الرجاء إدخال الاسم"), Length(max=150)],
    )
    employee_id = StringField(
        "الرقم الوظيفي",
        validators=[DataRequired(message="الرجاء إدخال الرقم الوظيفي"), Length(max=50)],
    )
    role = SelectField(
        "الدور",
        choices=[(r, Roles.label(r)) for r in Roles.ALL],
        validators=[DataRequired(message="الرجاء اختيار الدور")],
    )
    # Department choices are populated per-request in the route.
    department_id = SelectField(
        "القسم", coerce=int,
        validators=[DataRequired(message="الرجاء اختيار القسم")],
    )
    email = StringField(
        "البريد الإلكتروني",
        validators=[Optional(), Email(message="بريد إلكتروني غير صالح"), Length(max=255)],
    )
    phone = StringField("الهاتف", validators=[Optional(), Length(max=40)])
    hire_date = DateField("تاريخ التعيين", validators=[Optional()])
    is_active = BooleanField("نشط", default=True)
