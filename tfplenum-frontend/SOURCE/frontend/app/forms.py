from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField
from wtforms.validators import DataRequired, IPAddress, NumberRange

class InventoryForm(FlaskForm):

  number_of_sensors_label = 'Number of Sensors'
  number_of_sensors_button_text = 'Submit'
  number_of_sensors = IntegerField(
  validators=[NumberRange(min=1, message='You must have at least one sensor')] \
  , render_kw={"placeholder": "Enter the number of sensors you plan to run in your kit"})

  dns_ip_label = 'DNS IP Address'
  dns_ip = StringField(
  description=
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break."              \
  , validators=[IPAddress(ipv4=True)]
  , render_kw={"placeholder": "192.168.1.50"})
