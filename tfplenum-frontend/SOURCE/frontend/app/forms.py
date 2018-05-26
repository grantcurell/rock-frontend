from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, IPAddress

class InventoryForm(FlaskForm):
    #username = StringField('Username', validators=[DataRequired()])
    #password = PasswordField('Password', validators=[DataRequired()])
    #remember_me = BooleanField('Remember Me')
    dns_ip = StringField('DNS IP Address', description=
    "The IP address of the system DNS server. You may define this or it will   \
     default  to using the master server's management IP. We suggest you leave \
     it to default  unless you have a specific reason to use a different DNS   \
     server. Keep in mind  you will need to manually provide all required DNS  \
     entries on your separate  DNS Server or the kit will break."              \
     , validators=[IPAddress(ipv4=True)], render_kw={"placeholder": "192.168.1.50"})
    submit = SubmitField('Save Inventory')
