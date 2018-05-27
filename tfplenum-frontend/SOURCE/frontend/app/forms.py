

class Field:
    def __init__(self, id=None, label=None, description=None, placeholder=None):
      self.id = id
      self.label = label
      self.description = description
      self.placeholder = placeholder

#class Bootstrap_StringField(StringField):
 # def __init__(self, label=None, placeholder=None, **kwargs):
#    super(Bootstrap_StringField, self).__init__(**kwargs)
#    self.label = label
#    self.placeholder = placeholder

class Button(Field, object):
    def __init__(self, button_text=None, **kwargs):
        super(Button, self).__init__(**kwargs)
        self.button_text = button_text

class InventoryForm:

  number_of_sensors = Button(
    id = 'num_sensors' \
  , label = 'Number of Sensors' \
  , button_text = 'Submit' \
  , placeholder = "Enter the number of sensors you plan to run in your kit")


  dns_ip = Field(
    label = 'DNS IP Address' \
  , description =
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break."              \
  , placeholder = "192.168.1.50")
