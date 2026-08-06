"""Recognition (Awards) assignment form."""

from flask_wtf import FlaskForm
from wtforms import DateField, SelectField, StringField, TextAreaField
from wtforms.validators import DataRequired, Length, Optional

from app.blueprints.recognition import AWARD_TYPES


class RecognitionForm(FlaskForm):
    # Staff choices are populated per-request in the route.
    staff_id = SelectField(
        "الموظف",
        coerce=int,
        validators=[DataRequired(message="الرجاء اختيار الموظف")],
    )
    award_type = SelectField(
        "نوع التكريم",
        choices=[(a, a) for a in AWARD_TYPES],
        validators=[DataRequired(message="الرجاء اختيار نوع التكريم")],
    )
    granted_by = StringField("مُنح بواسطة", validators=[Optional(), Length(max=150)])
    awarded_on = DateField("التاريخ", validators=[Optional()])
    note = TextAreaField("سبب التكريم", validators=[Optional(), Length(max=2000)])
