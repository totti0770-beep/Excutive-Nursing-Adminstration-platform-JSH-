"""Performance metric entry form."""

from flask_wtf import FlaskForm
from wtforms import DateField, DecimalField, SelectField
from wtforms.validators import DataRequired, NumberRange, Optional

from app.blueprints.performance import METRICS


class PerformanceForm(FlaskForm):
    # Staff choices are populated per-request in the route.
    staff_id = SelectField(
        "الموظف",
        coerce=int,
        validators=[DataRequired(message="الرجاء اختيار الموظف")],
    )
    metric_name = SelectField(
        "المؤشر",
        choices=[(m, m) for m in METRICS],
        validators=[DataRequired(message="الرجاء اختيار المؤشر")],
    )
    value = DecimalField(
        "القيمة (%)",
        validators=[
            DataRequired(message="الرجاء إدخال القيمة"),
            NumberRange(min=0, max=100, message="القيمة يجب أن تكون بين 0 و 100"),
        ],
    )
    date = DateField("التاريخ", validators=[Optional()])
