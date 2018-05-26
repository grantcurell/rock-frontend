from flask_wtf import FlaskForm
from wtforms import StringField, BooleanField, SubmitField
from wtforms.validators import DataRequired, IPAddress, NumberRange

# Override the StringField class so that formatting works with Bootstrap
class Bootstrap_StringField(StringField):

  def __init__(self, label=None, placeholder=None, **kwargs):
    super(Bootstrap_StringField, self).__init__(**kwargs)
    self.label = label
    self.placeholder = placeholder

class CollectData(FlaskForm):
  number_of_sensors = StringField(description=
  "The number of sensors you plan to run in your kit" \
  , validators=[NumberRange(min=1, message='You must have at least one sensor')])

class InventoryForm(FlaskForm):

  dns_ip = Bootstrap_StringField(
  description=
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break."              \
  , validators=[IPAddress(ipv4=True)]
  , label = 'DNS IP Address'
  , placeholder = "192.168.1.50")
