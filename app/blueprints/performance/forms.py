"""Performance metric entry form."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import DateField, DecimalField, SelectField
from wtforms.validators import DataRequired, NumberRange, Optional

from app.blueprints.performance import METRICS


class PerformanceForm(FlaskForm):
    # Staff choices are populated per-request in the route.
    staff_id = SelectField(
        _l("الموظف"),
        coerce=int,
        validators=[DataRequired(message=_l("الرجاء اختيار الموظف"))],
    )
    metric_name = SelectField(
        _l("المؤشر"),
        # Value stays the canonical Arabic string (it is what gets stored);
        # only the visible label follows the interface language.
        choices=[(m, _l(m)) for m in METRICS],
        validators=[DataRequired(message=_l("الرجاء اختيار المؤشر"))],
    )
    value = DecimalField(
        _l("القيمة (%)"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال القيمة")),
            NumberRange(min=0, max=100, message=_l("القيمة يجب أن تكون بين 0 و 100")),
        ],
    )
    date = DateField(_l("التاريخ"), validators=[Optional()])
