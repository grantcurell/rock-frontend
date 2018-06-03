import copy

# https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
class Field:
    def __init__(self, form_name, label, html5_constraint=None, valid_feedback=None,
                 invalid_feedback=None, required=False, description=None, placeholder=None,
                 input_type='text'):
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

class CheckBox:
    def __init__(self, label, description=None):
        self.label = label
        self.description = description

class DropDown:
    def __init__(self, form_name, label, options, dropdown_text, description=None):
        self.form_name = 'form_' + form_name
        self.dropdown_id = form_name + '_dropdown'
        self.label = label
        self.description = description
        self.options = options
        self.dropdown_text = dropdown_text

class InventoryForm:

  ip_constraint = 'pattern=((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$'

  navbar_elements = {
    'Kit Configuration': 'kit_configuration'
  , 'Help': 'help'
  }

  ###########################
  # Host Settings           #
  ###########################

  # Server form

  number_of_servers = Button(
    form_name = 'number_of_servers'
  , label = 'Number of Servers'
  , button_text = 'Submit'
  , placeholder = "Enter the number of servers you have"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , required = True
  , invalid_feedback = 'You must have at least one server.'
  , reaction_file = 'button_reaction_number_of_servers.js')

  server_is_master_server_checkbox = CheckBox(
  label = "Is Kubernetes master server?"
  , description = "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
   There can only be one master server. It is a bit like the Highlander that way.\
   The master server is special in that it runs the Kubernetes master and is     \
   responsible for deploying services out to all the other hosts in the cluster. \
   This server should be fairly beefy. By default, this server will also provide \
   DNS to the rest of the kit for internal services. WARNING: If this server     \
   fails, the entire kit goes down with it!!!")

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
  , reaction_file = 'button_reaction_gather_server_facts.js')

  # Sensor form

  number_of_sensors = Button(
    form_name = 'number_of_sensors'
  , label = 'Number of Sensors'
  , button_text = 'Submit'
  , placeholder = "Enter the number of sensors you have"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Gather Facts\"!'
  , invalid_feedback = 'You must have at least one sensor.')

  ###########################
  # General Settings        #
  ###########################

  dns_ip = Field(
    form_name = 'dns_ip'
  , label = 'DNS IP Address'
  , placeholder = "192.168.1.50"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address'
  , required = False
  , description =
  "The IP address of the system DNS server. You may define this or it will   \
   default  to using the master server's management IP. We suggest you leave \
   it to default  unless you have a specific reason to use a different DNS   \
   server. Keep in mind  you will need to manually provide all required DNS  \
   entries on your separate  DNS Server or the kit will break.")

  ###########################
  # Sensor Settings         #
  ###########################

  sensor_storage_type = DropDown(
    form_name = 'sensor_storage_type'
  , label = 'Sensor Storage Type'
  #, required = True TODO NEED TO ADD A DEFAULT
  , description =
  "The kit can use two types of storage for PCAP. One is clustered Ceph storage \
  and the other is a disk on the sensor itself. The advantage to clustered storage \
  is that all hard drives given to Ceph are treated like one \"mega hard drive\". \
  This means that you may have PCAP come in on sensor 1, but if its disk is filling \
  up, it can just write that data to the disk on sensor 2 because it is also part \
  of the Ceph cluster. The downside is that now all of the internal kit traffic \
  must traverse the internal kit network backbone. If you have a 10Gb/s link, this \
  may not be a big deal to you. If you only have a 1Gb/s link, this will likely be \
  a bottleneck. However, if you aren't capturing a lot of traffic, this may not \
  be a big deal to you. In direct attached storage mode, you will write the data \
  directly to a locally attached disk or folder on the sensor. This obviously is \
  much faster, but has the downside in that once that disk is full, the data has \
  to roll even if there is space available elsewhere in the kit. Regardless of your \
  decision, this only applies to PCAP. Everything else will use clustered storage \
  with Ceph. Though, that traffic is only a fraction of what PCAP consumes in most \
  cases."
  , options = ['Use Ceph clustered storage for PCAP', 'Use hard drive for PCAP storage']
  , dropdown_text = 'Storage Type')

  moloch_pcap_folder = Field(
     form_name = 'moloch_pcap_folder'
   , label = 'Moloch PCAP Folder'
   , placeholder = "/pcap"
   , input_type = 'text'
   , html5_constraint = ip_constraint
   , invalid_feedback = 'You must enter a valid Linux path'
   , required = True
   , description =
   "This is the folder to which Moloch will write its PCAP data. \
   This must be defined if you are going to use Moloch in direct disk access mode \
   which is the default. We recommend you dedicate a separate disk to PCAP, in which \
   case this will become a mount point. However this can also be a folder. by itself. \
   If you chose to use a separate disk for PCAP you can define that on a per-host \
   basis in the \"Sensor\" section of \"Host Settings\". This will drastically improve \
   system performance.")

  # Moloch Settings

  moloch_bpf = Field(
    form_name = 'moloch_bpf'
  , label = 'Moloch BPF Filter'
  , placeholder = "WARNING: MOLOCH WILL NOT WORK IF THIS IS WRONG"
  , input_type = 'text'
  , required = False
  , description =
  "See https://biot.com/capstats/bpf.html for a full description of different BPF \
  filters. We strongly recommend you test any BPF filters you choose to use with \
  tcpdump before you submit them here. There is no built in validator in this web \
  UI for BPF filters. (Though feel free to write one and push it to us.) If you get \
  this wrong, Moloch will not work correctly. See https://github.com/aol/moloch/wiki/Settings \
  for Moloch's description. If you enter a filter here, Moloch will ONLYprocess \
  the packets it matches and will discard everything it does NOT match.")

  moloch_bpf = Field(
    form_name = 'moloch_bpf'
  , label = 'Moloch BPF Filter'
  , placeholder = "WARNING: MOLOCH WILL NOT WORK IF THIS IS WRONG"
  , input_type = 'text'
  , required = False
  , description =
  "See https://biot.com/capstats/bpf.html for a full description of different BPF \
  filters. We strongly recommend you test any BPF filters you choose to use with \
  tcpdump before you submit them here. There is no built in validator in this web \
  UI for BPF filters. (Though feel free to write one and push it to us.) If you get \
  this wrong, Moloch will not work correctly. See https://github.com/aol/moloch/wiki/Settings \
  for Moloch's description. If you enter a filter here, Moloch will ONLY process \
  the packets it matches and will discard everything it does NOT match.")

  moloch_dontSaveBPFs = Field(
    form_name = 'moloch_dontSaveBPFs'
  , label = 'Moloch Don\'t Save BPF Filter'
  , placeholder = "WARNING: MOLOCH WILL NOT WORK IF THIS IS WRONG"
  , input_type = 'text'
  , required = False
  , description =
  "See https://biot.com/capstats/bpf.html for a full description of different BPF \
  filters. We strongly recommend you test any BPF filters you choose to use with \
  tcpdump before you submit them here. There is no built in validator in this web \
  UI for BPF filters. (Though feel free to write one and push it to us.) If you get \
  this wrong, Moloch will not work correctly. See https://github.com/aol/moloch/wiki/Settings \
  for Moloch's description. If you enter a filter here, Moloch will ONLY save the \
  PCAP for the packets it matches and will discard everything it does NOT match.<br>\
  This expects a semicolon ';' separated list of bpf filters which when matched \
  for a session causes the remaining pcap from being saved for the session. It is \
  possible to specify the number of packets to save per filter by ending with a \
  :num. For example dontSaveBPFs = port 22:5 will only save 5 packets for port 22 \
  sessions. Currently only the initial packet is matched against the bpfs.")

class HelpPage(InventoryForm):
    def __init__(self):
        self.host_settings = [self.server_is_master_server_checkbox]
        self.general_settings = [self.dns_ip]
        self.moloch_settings = [self.sensor_storage_type, self.moloch_pcap_folder, self.moloch_bpf, self.moloch_dontSaveBPFs]
