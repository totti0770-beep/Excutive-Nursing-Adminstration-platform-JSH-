"""Staff add/edit form (Flask-WTF)."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import BooleanField, DateField, SelectField, StringField
from wtforms.validators import DataRequired, Email, Length, Optional

from app.security import Roles


class StaffForm(FlaskForm):
    name = StringField(
        _l("الاسم"),
        validators=[DataRequired(message=_l("الرجاء إدخال الاسم")), Length(max=150)],
    )
    employee_id = StringField(
        _l("الرقم الوظيفي"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال الرقم الوظيفي")),
            Length(max=50),
        ],
    )
    role = SelectField(
        _l("الدور"),
        choices=[(r, Roles.label(r)) for r in Roles.ALL],
        validators=[DataRequired(message=_l("الرجاء اختيار الدور"))],
    )
    # Department choices are populated per-request in the route.
    department_id = SelectField(
        _l("القسم"),
        coerce=int,
        validators=[DataRequired(message=_l("الرجاء اختيار القسم"))],
    )
    email = StringField(
        _l("البريد الإلكتروني"),
        validators=[
            Optional(),
            Email(message=_l("بريد إلكتروني غير صالح")),
            Length(max=255),
        ],
    )
    phone = StringField(_l("الهاتف"), validators=[Optional(), Length(max=40)])
    hire_date = DateField(_l("تاريخ التعيين"), validators=[Optional()])
    is_active = BooleanField(_l("نشط"), default=True)
