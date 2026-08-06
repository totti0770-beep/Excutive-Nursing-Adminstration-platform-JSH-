"""Recognition (Awards) assignment form."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import DateField, SelectField, StringField, TextAreaField
from wtforms.validators import DataRequired, Length, Optional

from app.blueprints.recognition import AWARD_TYPES


class RecognitionForm(FlaskForm):
    # Staff choices are populated per-request in the route.
    staff_id = SelectField(
        _l("الموظف"),
        coerce=int,
        validators=[DataRequired(message=_l("الرجاء اختيار الموظف"))],
    )
    award_type = SelectField(
        _l("نوع التكريم"),
        # Value stays the canonical Arabic string (it is what gets stored);
        # only the visible label follows the interface language.
        choices=[(a, _l(a)) for a in AWARD_TYPES],
        validators=[DataRequired(message=_l("الرجاء اختيار نوع التكريم"))],
    )
    granted_by = StringField(_l("مُنح بواسطة"), validators=[Optional(), Length(max=150)])
    awarded_on = DateField(_l("التاريخ"), validators=[Optional()])
    note = TextAreaField(_l("سبب التكريم"), validators=[Optional(), Length(max=2000)])
