
# https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
class Field:
    def __init__(self, id=None, label=None, description=None, placeholder=None,
                 input_type=None, html5_constraint=None, required=True, valid_feedback=None,
                 invalid_feedback=None):
      self.id = id
      self.label = label
      self.description = description
      self.placeholder = placeholder
      self.input_type = input_type
      self.html5_constraint = html5_constraint
      self.valid_feedback = valid_feedback
      self.invalid_feedback = invalid_feedback

      if required:
          self.required = 'required'

class Button(Field, object):
    def __init__(self, button_text=None, **kwargs):
        super(Button, self).__init__(**kwargs)
        self.button_text = button_text

class InventoryForm:

  number_of_servers = Button(
    id = 'num_servers' \
  , label = 'Number of Servers' \
  , button_text = 'Submit' \
  , placeholder = "Enter the number of servers you plan to run in your kit" \
  , input_type = 'number' \
  , html5_constraint = 'min=1' \
  , required = True \
  , valid_feedback = 'Looks good! Configure your sensors in the \'Server Settings\' section below.' \
  , invalid_feedback = 'You must have at least one server.')

  number_of_sensors = Button(
    id = 'num_sensors' \
  , label = 'Number of Sensors' \
  , button_text = 'Submit' \
  , placeholder = "Enter the number of sensors you plan to run in your kit" \
  , input_type = 'number' \
  , html5_constraint = 'min=1' \
  , required = True \
  , valid_feedback = 'Looks good! Configure your sensors in the \'Sensor Settings\' section below.' \
  , invalid_feedback = 'You must have at least one sensor.')

  dns_ip = Field(
    label = 'DNS IP Address' \
  , description =
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break."              \
  , placeholder = "192.168.1.50")
