from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, IPAddress

class InventoryForm(FlaskForm):
    #username = StringField('Username', validators=[DataRequired()])
    #password = PasswordField('Password', validators=[DataRequired()])
    #remember_me = BooleanField('Remember Me')
    dns_ip = StringField('DNS IP Address', validators=[IPAddress(ipv4=True)])
    submit = SubmitField('Save Inventory')
