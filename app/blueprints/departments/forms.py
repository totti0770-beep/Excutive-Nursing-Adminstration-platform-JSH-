"""Department add/edit form."""

from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Length, Optional


class DepartmentForm(FlaskForm):
    name = StringField(
        "اسم القسم",
        validators=[DataRequired(message="الرجاء إدخال اسم القسم"), Length(max=150)],
    )
    location = StringField("الموقع", validators=[Optional(), Length(max=150)])
    head_name = StringField("رئيس القسم", validators=[Optional(), Length(max=150)])
