
# https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
class Field:
    def __init__(self, form_name=None, label=None, description=None, placeholder=None,
                 input_type='text', html5_constraint=None, valid_feedback=None,
                 invalid_feedback=None, required=True):
      self.form_name = 'form_' + form_name
      self.field_id = form_name + '_field'
      self.label = label
      self.description = description
      self.placeholder = placeholder
      self.input_type = input_type
      self.html5_constraint = html5_constraint
      self.valid_feedback = valid_feedback
      self.invalid_feedback = invalid_feedback

      if required:
          self.required = 'required'

# button_id (string): The id which will be used to identify the input field
# button_label (string): The text which will affix the left side of the input field
# button_text (string): The text for the button itself
# button_description (string): This is optional. If you want to provide a description
#                              below the button you can do so with this option.
# button_placeholder (string): The placeholder text which will appear in the text field
# button_valid_feedback (string): The feedback to show if the field is correct
# button_invalid_feedback (string): The feedback to show if the user inputs something
#                                   incorrect.
class Button(Field, object):
    def __init__(self, button_text=None, **kwargs):
        super(Button, self).__init__(**kwargs)
        self.button_id = kwargs.get('form_name') + '_button'
        self.button_text = button_text

class CheckBox:
    def __init__(self, tooltip_text):
        self.tooltip_text = tooltip_text

class InventoryForm:

  number_of_servers = Button(
    form_name = 'number_of_servers'
  , label = 'Number of Servers'
  , button_text = 'Submit'
  , placeholder = "Enter the number of servers you have"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , required = True
  , invalid_feedback = 'You must have at least one server.')

  server_is_master_server_checkbox = CheckBox(
  "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
   There can only be one master server. It is a bit like the Highlander that way.\
   The master server is special in that it runs the Kubernetes master and is     \
   responsible for deploying services out to all the other hosts in the cluster. \
   This server should be fairly beefy. By default, this server will also provide \
   DNS to the rest of the kit for internal services. WARNING: If this server     \
   fails, the entire kit goes down with it!!!"
  )

  host_server = Button(
    form_name = 'host_server_form'
  , label = 'Management IP Address'
  , button_text = 'Gather Facts'
  , placeholder = "Server's management IP address"
  , input_type = 'text'
  , html5_constraint = 'pattern=((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$'
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Gather Facts\"!'
  , invalid_feedback = 'You must input the server management IP address.')

  number_of_sensors = Button(
    form_name = 'number_of_sensors'
  , label = 'Number of Sensors'
  , button_text = 'Submit'
  , placeholder = "Enter the number of sensors you have"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , required = True
  , invalid_feedback = 'You must have at least one sensor.')

  dns_ip = Field(
    form_name = 'dns_ip'
  , label = 'DNS IP Address'
  , description =
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break."              \
  , placeholder = "192.168.1.50")
