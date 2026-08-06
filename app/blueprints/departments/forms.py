"""Department add/edit form."""

from flask_babel import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Length, Optional


class DepartmentForm(FlaskForm):
    name = StringField(
        _l("اسم القسم"),
        validators=[
            DataRequired(message=_l("الرجاء إدخال اسم القسم")),
            Length(max=150),
        ],
    )
    location = StringField(_l("الموقع"), validators=[Optional(), Length(max=150)])
    head_name = StringField(_l("رئيس القسم"), validators=[Optional(), Length(max=150)])
