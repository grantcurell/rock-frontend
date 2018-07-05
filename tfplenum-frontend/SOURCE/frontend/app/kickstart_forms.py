import copy

# https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
# form_name (str): The name which will be applied to the form in which this field is placed
# label (str): The label which will be applied to the field. Ex: Number of Sensors
# html5_constrant: See https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
# valid_feedback (str): The message to display when the user types something which
#                       meets the above defined validation constraint
# invalid_feedback (str): The message tobe displayed when the constraint is not met
# default_value (str): The default value that you would like to occupy the field
# required (bool): Whether the field is or is not required
# description (str): The description which you would like to appear in the help page
# placeholder (str): The placeholder text which will appear inside of the field
# input_type: See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
class Field:
    def __init__(self, form_name, label, html5_constraint=None, valid_feedback='Good to go!',
                 invalid_feedback='This is not a valid value.', disabled=False, hidden=False, default_value=None,
                 required=False, description=None, placeholder=None, input_type='text'):
      self.form_name = 'form_' + form_name
      self.field_id = form_name + '_field'
      self.label = label
      self.description = description
      self.placeholder = placeholder
      self.input_type = input_type
      self.html5_constraint = html5_constraint
      self.valid_feedback = valid_feedback
      self.invalid_feedback = invalid_feedback
      self.default_value = default_value
      self.disabled = disabled
      self.hidden = hidden

      # This is the HTML file generally associated with displaying this field.
      # You don't have to use this, but it is handy for displaying things in a loop.
      self.include_html = "text_input.html"

      if required:
          self.required = 'required'

    # This is a mammoth hack because Jinja2 doesn't allow assignment within
    # templates. To get around this, I provide this method which simply modifies
    # various fields within the object and then returns the copy of the object.
    # This allows the code to effectively modify the object - without modifying
    # the object.

    # This function is meant for use when you have something like a for loop
    # in Jinja and you need to provide different variables to a button on each
    # iteration of the loop.
    # form_name (str): The updated form name you would like returned with the copy
    #                  of your object.
    # field_id (str): The updated field id you would like returned.
    # args: See: https://stackoverflow.com/questions/3394835/args-and-kwargs
    #       for a good explanation of args. This is for providing arbitrary arguments
    #       to your reaction file. For example, you could provide a new argument
    #       called 'server_1'. Within the reaction file, you could access this
    #       by calling object.args[0]
    def change_values(self, form_name, field_id, *args):
        copy_of_self = copy.deepcopy(self)
        copy_of_self.form_name = form_name
        copy_of_self.field_id = field_id
        copy_of_self.args = args
        return copy_of_self

# button_text (str): The text you want displayed on the button itself
# reaction_file (str): A file containing the javascript you would like executed
#                      when someone clicks the button. This will be included as
#                      part of the else condition.
# For all other arguments see field. This class inherits from field so any argument
# which may be applied to field may also be applied here.
class Button(Field, object):
    def __init__(self, button_text, reaction_file=None, **kwargs):
        super(Button, self).__init__(**kwargs)
        self.button_id = kwargs.get('form_name') + '_button'
        self.button_text = button_text
        self.reaction_file = reaction_file

        # This is the HTML file generally associated with displaying this field.
        # You don't have to use this, but it is handy for displaying things in a loop.
        self.include_html = "button.html"

    # This is a mammoth hack because Jinja2 doesn't allow assignment within
    # templates. To get around this, I provide this method which simply modifies
    # various fields within the object and then returns the copy of the object.
    # This allows the code to effectively modify the object - without modifying
    # the object.

    # This function is meant for use when you have something like a for loop
    # in Jinja and you need to provide different variables to a button on each
    # iteration of the loop.
    # form_name (str): The updated form name you would like returned with the copy
    #                  of your object.
    # field_id (str): The updated field id you would like returned.
    # button_id (strp): The updated button id you would like returned.
    # args: See: https://stackoverflow.com/questions/3394835/args-and-kwargs
    #       for a good explanation of args. This is for providing arbitrary arguments
    #       to your reaction file. For example, you could provide a new argument
    #       called 'server_1'. Within the reaction file, you could access this
    #       by calling object.args[0]
    def change_values(self, form_name, field_id, button_id, *args):
        copy_of_self = copy.deepcopy(self)
        copy_of_self.form_name = form_name
        copy_of_self.field_id = field_id
        copy_of_self.button_id = button_id
        copy_of_self.args = args
        return copy_of_self

class GenericButton:
    def __init__(self, form_name, label, description=None, callback=None):
        self.form_name = form_name
        self.generic_button_id = form_name + '_generic_button'
        self.css_class = form_name + '_generic_button_class'
        self.label = label
        self.description = description
        self.callback = callback

class CheckBox:
    def __init__(self, form_name, label, disabled=False, description=None):
        self.form_name = form_name
        self.checkbox_id = form_name + '_checkbox'
        self.field_id = form_name + '_checkbox' # This is for niche cases where we
                                                # a foor loop to loop over fields
                                                # and checkboxes
        self.css_class = form_name + '_checkbox_class'
        self.label = label
        self.description = description
        self.disabled = disabled

class DropDown:
    def __init__(self, form_name, label, options, dropdown_text, callback=None, description=None, default_option=None):
        self.form_name = 'form_' + form_name
        self.dropdown_id = form_name + '_dropdown'
        self.label = label
        self.description = description
        self.options = options
        self.dropdown_text = dropdown_text
        self.default_option = default_option
        self.callback = callback

        # This is the HTML file generally associated with displaying this field.
        # You don't have to use this, but it is handy for displaying things in a loop.
        self.include_html = "node_dropdown.html"

    def change_values(self, form_name, dropdown_id, *args):
        copy_of_self = copy.deepcopy(self)
        copy_of_self.form_name = form_name
        copy_of_self.dropdown_id = dropdown_id    
        copy_of_self.args = args
        return copy_of_self

# name (str): The name of your modal (no spaces)
# modal_title (str): The title that will appear along with the modal box
# modal_text (str): The text that will appear in the modal box
# secondary_button_text (str): The label of the secondary button in the modal
# primary_button_text (str): The text on the primary button

# The below explain the additional variables that you might have need to reference
# but are not necessary for calling the modal
# button_id (str): The id of the button that will trigger this modal popup. You must
#                  must provide this yourself. You could use GenericButton.
# modal_id (str): The ID of the modal box itself
# modal_label_id (str): The ID of the modal label itself
# button_id_secondary (str): The ID of the secondary button
# button_id_primary (str): The Id of the primary button
class ModalPopUp:
    def __init__(self, name, modal_title, modal_text, secondary_button_text, primary_button_text):
      self.button_id = name + "_button_id"
      self.modal_id = name + "_modal_id"
      self.modal_label_id = name + "_modal_label_id"
      self.modal_title = modal_title
      self.modal_text = modal_text
      self.button_id_secondary = name + "_modal_button_id_secondary"
      self.secondary_button_text = secondary_button_text
      self.button_id_primary = name + "_modal_button_id_primary"
      self.primary_button_text = primary_button_text



class KickstartInventoryForm:

  ip_constraint = 'pattern=((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$'

  navbar_elements = {
    'Kit Configuration': 'kit_configuration'
  , 'Kickstart Configuration': 'kickstart'
  , 'Help': 'help'
  }

  advanced_system_settings_text = 'All of the required settings below will autopopulate \
  based on facts gathered from the servers. It is not necessary to change any of \
  them in order for the system to function. However, you may want to update some \
  fields manually based on your specific use cases.'

  advanced_settings_button = GenericButton(
    form_name = 'advanced_settings'
    , label = 'Show/Hide Advanced Settings'
  )

  ###########################
  # Common Settings         #
  ###########################

  dns_ip = Field(
    form_name = 'dns_ip'
  , label = 'DNS IP Address'
  , placeholder = "Same as Master Server management IP"
  , input_type = 'text'
  , html5_constraint = 'ip_constraint'
  , invalid_feedback = 'You must enter a valid IP address'
  , required = False
  , description =
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break.")

  is_offline_build = CheckBox(
    form_name = "is_offline_build"
  , label = "Is offline build?"
  , description =
  "Check this if you are setting up your build using the prebuilt offline installer.")

  enable_dhcp_server = CheckBox(
    form_name = "enable_dhcp"
  , label = "Enable DHCP Server?"
  , description =
  "Check this if you are not using an external dhcp server.  A dhcp server is required for kickstart.")

  enable_dns_server = CheckBox(
    form_name = "enable_dns_server"
  , label = "Enable DNS Server?"
  , description =
  "Check this if you are not using an external dns server.")

  dhcp_start = Field(
    form_name = 'dhcp_start'
  , label = 'DHCP Starting Ip Address'
  , placeholder = "192.168.1.50"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = False
  , description = "")

  dhcp_end = Field(
    form_name = 'dhcp_end'
  , label = 'DHCP Ending Ip Address'
  , placeholder = "192.168.1.60"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = False
  , description = "")

  dns = Field(
    form_name = 'dns'
  , label = 'DNS'
  , placeholder = "192.168.1.1"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "")

  gateway = Field(
    form_name = 'gateway'
  , label = 'Gateway'
  , placeholder = "192.168.1.1"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "")

  netmask = Field(
    form_name = 'netmask'
  , label = 'Netmask'
  , placeholder = "255.255.255.0"
  , input_type = 'text'  
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "")

  root_password = Field(
    form_name = 'root_password'
  , label = 'Root Password'
  , placeholder = ""
  , input_type = 'password'
  , html5_constraint = ""
  , invalid_feedback = 'You must enter a root password.'
  , required = True
  , description = "")


  ###########################
  # Node Settings         #
  ###########################

  # Node form

  number_of_nodes = Button(
    form_name = 'number_of_nodes'
  , label = 'Number of Nodes'
  , button_text = 'Submit'
  , placeholder = "Enter the number of nodes you have"
  , input_type = 'number'
  , html5_constraint = 'min=2'
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Submit\" on the right!'
  , invalid_feedback = 'You must have at least two server.'
  , reaction_file = 'button_reaction_number_of_nodes.js')  

  host_server = Button(
    form_name = 'host_server'
  , label = 'Management IP Address'
  , button_text = 'Gather Facts'
  , placeholder = "Server's management IP address"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Gather Facts\"! Heads up, once you add a server successfully, you can\'t remove it!'
  , invalid_feedback = 'You must input the server management IP address.'
  , reaction_file = 'button_reaction_gather_device_facts.js')
  
  ip_address = Field(
    form_name = 'ip_address'
  , label = 'IP Address'
  , placeholder = "192.168.1.20"
  , input_type = 'text'
  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "")

  mac_address = Field(
    form_name = 'mac_address'
  , label = 'MAC Address'
  , placeholder = "01:23:45:67:89:ab"
  , input_type = 'text'
  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  , html5_constraint = 'pattern=(^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$)'
  , invalid_feedback = 'You must enter a valid mac address'
  , required = True
  , description = "")

  boot_drive = Field(
    form_name = 'boot_drive'
  , label = 'Boot Drive'
  , placeholder = "sda"
  , input_type = 'text'
  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  , html5_constraint = ""
  , invalid_feedback = ''
  , required = True
  , description = "")

  hostname = Field(
    form_name = 'hostname'
  , label = 'Hostname'
  , placeholder = "rockserver1.lan"
  , input_type = 'text'
  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  , html5_constraint = ""
  , invalid_feedback = 'You must enter a valid hostname.'
  , required = True
  , description = "")

  pxe_type = DropDown(
      form_name = 'pxe_type'
    , label = 'PXE Type'
    #, required = True TODO NEED TO ADD A DEFAULT
    , description = ""
    , options = ['BIOS', 'UEFI']
    # WARNING: Do not change the order of these options. There are several parts of the code
    # which depend on them. You can search for them by looking for form.sensor_storage_type.options
    , dropdown_text = 'PXE Type'
    , default_option = 'BIOS')

  timezone = DropDown(
      form_name = 'timezone'
    , label = 'Timezone'
    #, required = True TODO NEED TO ADD A DEFAULT
    , description = ""
    , options = ['Chicago', 'Los_Angeles', 'New_York', 'UTC']
    # WARNING: Do not change the order of these options. There are several parts of the code
    # which depend on them. You can search for them by looking for form.sensor_storage_type.options
    , dropdown_text = 'Timezone'
    , default_option = 'Chicago')

  repo_sync_centos = CheckBox(
    form_name = "repo_sync_centos"
  , label = "CentOS"
  , description =
  "Check this if you are setting up your build using the prebuilt offline installer.")

  repo_sync_rhel = CheckBox(
    form_name = "repo_sync_rhel"
  , label = "RHEL"
  , description =
  "Check this if you are setting up your build using the prebuilt offline installer.")

  repo_sync_additional = CheckBox(
    form_name = "repo_sync_additional"
  , label = "Additional (EPEL, RockNSM, Ceph, Kubernetes)"
  , description =
  "Check this if you are setting up your build using the prebuilt offline installer.")
 
  common_settings = [is_offline_build]
  node_settings = [number_of_nodes]
  pxe_type_settings = [pxe_type]
  timezone_settings = [timezone]