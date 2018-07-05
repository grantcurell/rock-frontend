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
        self.include_html = "dropdown.html"
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
# secondary_button_close: True if you want the secondary button to close the modal
#                         and false if you don't
class ModalPopUp:
    def __init__(self, name, modal_title, modal_text, primary_button_text=None, secondary_button_text=None, secondary_button_close=True):
      self.button_id = name + "_button_id"
      self.modal_id = name + "_modal_id"
      self.modal_label_id = name + "_modal_label_id"
      self.modal_title = modal_title
      self.modal_text = modal_text
      self.button_id_secondary = name + "_modal_button_id_secondary"
      self.secondary_button_text = secondary_button_text
      self.button_id_primary = name + "_modal_button_id_primary"
      self.primary_button_text = primary_button_text
      self.secondary_button_close = secondary_button_close

class InventoryForm:

  inventory_path = '/opt/tfplenum/playbooks/inventory.yml'

  ip_constraint = 'pattern=((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$'

  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # ^ I left the line above because it was helpful, but I didn't end up using it
  # in the final version
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  cidr_constraint = "pattern=(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[0-9])";

  # If you need to add elements to the navbar you can do it here
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

  what_is_ceph = {"label": "What is Ceph?", "description": "Ceph is what is called a \
  clustered storage solution. Ceph allows \
  us to take a hard drive on an individual machine and add it to a Ceph cluster. \
  Instead of that hard drive only being attached to the machine on which it physically \
  resides, it is effectively added to a singular \"mega hard drive\" which is spread \
  across multiple devices. Kubernetes can then create what are called persistent \
  volumes from the space allocated from this hard drive. A persistent volume acts \
  like a hard drive attached to a single Docker Container. For example, you might have \
  a persistent volume of 8 GB attached to an Elasticsearch instance. If that instance \
  of Elasticsearch dies for whatever reason, Kubernetes creates another identical \
  instance and reattaches the persistent volume containing the Elasticsearch data. \
  In this way, containers can die, migrate, or be manipulated without loss of data."}

  help_me_decide = {"label": "Help me decide", "description": "If you plan to have a high volume \
  of input traffic to the kit, typically more than 1 Gb/s, it's typically better to go with \"Use hard drive for PCAP storage\"\
  storage, but that assumes a 1Gb/s network backbone. If you have a faster backbone, than it's really \
  a bit of a judgement call. The bottleneck is typically the network backbone. When \
  you have all that PCAP coming in, parts must traverse the network if you are using \
  clustered storage. This can frequently overwhelm a 1Gb/s pipe. If you are on a slower \
  network, it's better to use Ceph because you get all the benefits of a clustered \
  storage solution. If you don't know, it's better to stick with \"Use hard drive for PCAP storage\""}

  inventory_generated_modal = ModalPopUp(
    name = 'inventory_generated_modal'
  , modal_title = 'Success'
  , modal_text = 'Inventory file generated successfully! File located at ' + inventory_path + '. You can now navigate away from the page.'
  , primary_button_text = 'Close')

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

  password = Field(
    form_name = 'password'
  , label = 'Root Password'
  , placeholder = "Root password for all devices"
  , input_type = 'text'
  , required = True
  , description =
  "This is the root password set on all the system devices. For initial setup it must \
  be the same for everything.")

  kubernetes_services_cidr = Field(
    form_name = 'kubernetes_services_cidr'
  , label = 'Kubernetes Service CIDR'
  , placeholder = "Put your Kubernetes Services CIDR here."
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = False
  , description =
  "Services_cidr is the range of addresses kubernetes will use for external services \
   This includes cockpit (a front end for Kubernetes), Moloch viewer, Kibana, elastichq, kafka-manager, and the \
   kubernetes dashboard. This will use a /28 under the hood. This means it will take \
   whatever IP address you enter and create a range addresses from that IP +16. For example, \
   192.168.1.16 would become a range from 192.168.1.16-31.")

  is_offline_build = CheckBox(
    form_name = "is_offline_build"
  , label = "Is offline build?"
  , description =
  "Check this if you are setting up your build using the prebuilt offline installer. \
  This is the installer on the control server shipped to you from the PMO. If you \
  uncheck this, it is expected that all boxes have access to commercial internet. \
  The online build will pull everything required from the Internet instead of the \
  controller. Use this if you are building the system at home.")

  ######################## ###
  # Server and Sensor Forms #
  ###########################

  use_in_ceph_cluster = GenericButton(
    form_name = 'use_in_ceph_cluster'
  , label = "Use drive in ceph cluster?"
  , description =
  "Use this field to mark the disks you will use for Ceph. You can choose to select \
  none. In this case, Ceph will still be installed and active on the machine so that \
  Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
  This is common on the sensors. You may choose to use direct attached storage for \
  your PCAP on one drive and then use the other for your OS. In which case, Moloch \
  can still write over the network to a clustered drive on another machine for its \
  metadata which is light weight especially compared to PCAP. You can select multiple \
  drives if you would like. Make sure you don't select the OS' drive as Ceph will \
  format and overwrite any drives you select.")

  ###########################
  # Server Settings         #
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
  , valid_feedback = 'Looks good! Now hit \"Submit\" on the right!'
  , invalid_feedback = 'You must have at least one server.'
  , reaction_file = 'button_reaction_number_of_servers.js')

  server_is_master_server_checkbox = CheckBox(
    form_name = "server_is_master_server_checkbox"
  , label = "Is Kubernetes master server?"
  , description =
  "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
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
  , reaction_file = 'button_reaction_gather_device_facts.js')

  # This is the form name for the ceph drive list
  server_ceph_drive_list = 'server_ceph_drive_list_form'

  # Elasticsearch Settings

  elastic_masters = Field(
     form_name = 'elastic_masters'
   , label = 'Elasticsearch Masters'
   , placeholder = "# of Elasticsearch masters"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , invalid_feedback = 'Enter the number of elasticsearch master instances you would like'
   , required = True
   , description =
   "The number of Elasticsearch masters you would like to run on your kit. Each of \
   these will run all Elasticsearch node types. Unless you are going to exceed 5 Elasticsearch \
   nodes, you should run masters instead of data instances. See https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html \
   for a description of the node types."
   , default_value = '3')

  elastic_datas = Field(
     form_name = 'elastic_datas'
   , label = 'Elasticsearch Data Nodes'
   , placeholder = "# of Elasticsearch data nodes"
   , input_type = 'number'
   , html5_constraint = 'min=0'
   , invalid_feedback = 'Enter the number of elasticsearch data instances you would like'
   , required = True
   , description =
   "The number of Elasticsearch data nodes you will run. Each of these run the Elasticsearch \
   data node type. You should use these if your instance count would exceed 5. \
   See https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html for \
   a description of the node types."
   , default_value = '0')

  elastic_cpus = Field(
     form_name = 'elastic_cpus'
   , label = 'Elasticsearch CPUs'
   , placeholder = "Logical CPUs per Elasticsearch instance"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , invalid_feedback = 'Enter a valid integer 1 or greater'
   , required = True
   , description =
   "The number of CPUs which will be assigned to each Elasticsearch instance."
   , default_value = '0')

  elastic_memory = Field(
     form_name = 'elastic_memory'
   , label = 'Elasticsearch Memory'
   , placeholder = "Memory in GB per Elasticsearch instance"
   , input_type = 'number'
   , html5_constraint = 'min=2'
   , invalid_feedback = 'Enter a valid integer 2 or greater'
   , required = True
   , description =
   "The amount of memory you would like to assign per Elasticsearch instance. Elasticsearch \
   will use the memlock feature of the OS to take the memory and immediately commit it for \
   itself. Good values depend very heavily on the type of traffic that the system runs and developing \
   good predictive models of what work is one of the more challenging engineering problems\
   that exists. We generally recommend you stick with the recommended default. If you \
   know what you are doing, you might try experimenting with this value."
   , default_value = '0')

  elastic_pv_size = Field(
     form_name = 'elastic_pv_size'
   , label = 'Elasticsearch Persistent Volume Size'
   , placeholder = "Storage space in GB per Elasticsearch instance"
   , input_type = 'number'
   , html5_constraint = 'min=8'
   , invalid_feedback = 'Enter a valid integer 8 or greater'
   , required = True
   , description =
   "The amount of space to allocate from the Ceph cluster to the persistent volume \
   used per Elasticsearch instance. See " + what_is_ceph['label'] + " for a description \
   of persistent volumes and Ceph."
   , default_value = '0')

  elastic_cpu_percentage = Field(
    form_name = 'elastic_cpu_percentage'
  , label = 'Elasticsearch CPU Percentage'
  , placeholder = "90"
  , input_type = 'number'
  , html5_constraint = 'min=1 max=99'
  , valid_feedback = 'Input is valid. (This just means you didn\'t type something silly. It doesn\'t necessarily mean you have enough resources.)'
  , invalid_feedback = 'Value must be between 1 and 99. At least 10% is required for other programs.'
  , required = True
  , description =
  "This is the percentage of server CPUs which the system will dedicated to \
  Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- CPUs here does not mean dedicated CPUs. \
  This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
  What this means is that Elasticsearch pods will have a request of \
  X value for the server's compute power. If Elasticsearch is using less than this, \
  other devices can use those resources. However, when under load, Elasticsearch is \
  guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
  Basically, you can think of this as a simple percentage of how much of the server\'s \
  CPU you want going to Elasticsearch."
  , default_value = '90')

  elastic_memory_percentage = Field(
    form_name = 'elastic_memory_percentage'
  , label = 'Elasticsearch RAM Percentage'
  , placeholder = "99"
  , input_type = 'number'
  , html5_constraint = 'min=1 max=99'
  , valid_feedback = 'Input is valid. (This just means you didn\'t type something silly. It doesn\'t necessarily mean you have enough resources.)'
  , invalid_feedback = 'Value must be between 1 and 99. At least 10% is required for other programs.'
  , required = True
  , description =
  "This is the percentage of server RAM which the system will dedicated to \
  Elasticsearch. ---SKIP IF YOU WANT SIMPLE--- \
  This setting actually controls limits as described here. https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#resource-requests-and-limits-of-pod-and-container \
  What this means is that Elasticsearch pods will have a request of \
  X value for the server's compute power. If Elasticsearch is using less than this, \
  other devices can use those resources. However, when under load, Elasticsearch is \
  guarenteed to have access up to X of the server's compute power. ---STOP SKIPPING HERE--- \
  Basically, you can think of this as a simple percentage of how much of the server\'s \
  RAM you want going to Elasticsearch."
  , default_value = '90')

  elastic_storage_percentage = Field(
    form_name = 'elastic_storage_percentage'
  , label = 'Elasticsearch Storage Space Percentage'
  , placeholder = "90"
  , input_type = 'number'
  , html5_constraint = 'min=1 max=99'
  , valid_feedback = 'Input is valid. (This just means you didn\'t type something silly, it could still be insufficient resources.)'
  , invalid_feedback = 'Value must be between 1 and 99'
  , required = True
  , description =
  "Setting this value correctly can be a bit confusing. It depends primarily if you \
  are running Ceph for PCAP storage or not. If you are not using Ceph for PCAP storage \
  then this value can be very high - we recommend around 90%. This is due to the \
  fact that Elasticsearch accounts for the overwhelming bulk of the resource demand \
  on the server and there's not much need for storing other things. However, if you \
  are using Ceph for PCAP then you will have to share server storage with Moloch. \
  Moloch also takes up a lot of space. If you are running Moloch, in general, we give \
  Moloch 60% and Elasticsearch 30%, but this depends heavily on the size of your disk storage."
  , default_value = '90')

  elastic_curator_threshold = Field(
    form_name = 'elastic_curator_threshold'
  , label = 'Elasticsearch Curator Threshold'
  , placeholder = "90"
  , input_type = 'number'
  , html5_constraint = 'min=1 max=99'
  , invalid_feedback = 'Value must be between 1 and 99'
  , required = True
  , description =
  "The percentage of maximum allocated space for Elasticsearch that can be filled \
  before Curator begins deleting indices. The oldest moloch indices that exceed \
  this threshold will be deleted."
  , default_value = '90')

  elastic_cpus_per_instance_ideal = Field(
    form_name = 'elastic_cpus_per_instance_ideal'
  , label = 'Ideal ES CPUs Per Instance'
  , placeholder = "8"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , invalid_feedback = 'Value must be 1 or greater'
  , required = True
  , description =
  "This is the value that the automatic resource computation algorithm will use to \
  maximize the number of Elasticsearch instances. We settled on 8 based on testing \
  and recommendations from Elasticsearch engineers. If you have fewer than this \
  number the algorithm will still adapt. Unless you really know what you are doing \
  we do not recommend changing this number."
  , default_value = '8')

  elastic_cpus_to_mem_ratio = Field(
    form_name = 'elastic_cpus_to_mem_ratio'
  , label = 'ES CPU to Memory Ratio Default'
  , placeholder = "3"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , invalid_feedback = 'Value must be 1 or greater'
  , required = True
  , description =
  "This is the ratio of CPUs to memory. This is the value that the automatic resource computation algorithm will use to \
  estimate memory resource requirement by default. This \
  can vary greatly dependent on the workload. Unless you really know what you are \
  doing we do not recommend changing this number. Keep in mind that this is the ratio \
  the algorithm begins with. If there are insufficient memory resources, it will \
  first try this number and then reduce it until it reaches 1:0 or a working configuration \
  is found."
  , default_value = '3')

  logstash_cpu_percentage = Field(
    form_name = 'logstash_cpu_percentage'
  , label = 'Logstash Servers CPU Percentage'
  , placeholder = "Percentage of server resources dedicated to Logstash"
  , input_type = 'number'
  , html5_constraint = 'min=1 max=99'
  , invalid_feedback = 'Enter a valid integer 1 or greater and 99 or less'
  , required = True
  , description =
  "The Percentage of the server CPU resources which will be dedicated to logstash. \
  Unlike some of the other calculations, this is a percentage of the total server \
  resources."
  , default_value = '5')

  logstash_replicas = Field(
     form_name = 'logstash_replicas'
   , label = 'Logstash Replicas'
   , placeholder = "The number of logstash instances you would like to run"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , invalid_feedback = 'Enter the number of elasticsearch master instances you would like'
   , required = True
   , description =
   "This is the number of instances of Logstash you would like to run."
   , default_value = '1')

  disable_autocalculate = CheckBox(
    form_name = "disable_autocalculate"
    , label = "Disable Autocalculations for Elasticsearch/Logstash/Moloch Threads/Bro Workers"
    , description =
    "By default, the system will calculate recommended values for the number of Elasticsearch \
    nodes required, Elasticsearch resource requirements, Logstash, Bro workers, and Moloch threads. \
    If you know what you are doing and you have a specific use case, you may not want these \
    values autocalculated for you. In general, you should use the field " + elastic_cpu_percentage.label + " and " + elastic_memory_percentage.label + " \
    to control the allocation of resources for Elasticsearch. The algorithm was based \
    on recommendations from Elasticsearch. However, you may disable these by unchecking \
    this checkbox.")

  # Sensor form

  host_sensor = Button(
    form_name = 'host_sensor'
  , label = 'Management IP Address'
  , button_text = 'Gather Facts'
  , placeholder = "Sensor's management IP address"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Gather Facts\"! Heads up, once you add a sensor successfully, you can\'t remove it!'
  , invalid_feedback = 'You must input the sensor management IP address.'
  , reaction_file = 'button_reaction_gather_device_facts.js')

  number_of_sensors = Button(
    form_name = 'number_of_sensors'
  , label = 'Number of Sensors'
  , button_text = 'Submit'
  , placeholder = "Enter the number of sensors you have"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , required = True
  , valid_feedback = 'Looks good! Now hit \"Submit\" on the right!'
  , invalid_feedback = 'You must have at least one sensor.'
  , reaction_file = 'button_reaction_number_of_sensors.js')

  bro_workers = Field(
     form_name = 'bro_workers'
   , label = 'Number of Bro Workers'
   , placeholder = "1"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , invalid_feedback = 'Enter a valid integer 1 or greater'
   , required = True
   , description =
   "The number of bro workers to run on each sensor. The worker is the Bro process \
    that sniffs network traffic and does protocol analysis on the reassembled traffic \
    streams. Most of the work of an active cluster takes place on the workers and \
    as such, the workers typically represent the bulk of the Bro processes that \
    are running in a cluster. See https://www.bro.org/sphinx/cluster/index.html for \
    more information.")

  moloch_threads = Field(
     form_name = 'moloch_threads'
   , label = 'Number of Moloch Threads'
   , placeholder = "1"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , invalid_feedback = 'Enter a valid integer 1 or greater'
   , required = True
   , description =
   "Number of threads to use to process packets AFTER the reader has received \
   the packets. This also controls how many packet queues there are, since each \
   thread has its own queue. Basically how much CPU to dedicate to parsing the \
   packets. Increase this if you get errors about dropping packets or the packetQ \
   is over flowing.")

  sensor_gather_facts_modal = ModalPopUp(
    name = 'sensor_gather_facts_modal'
  , modal_title = 'Is this a remote sensor?'
  , modal_text =   "Is this sensor going to be geographically separate from the servers \
    for your kit? If so, then you probably want to click yes here. A remote sensor is a sensor \
    deployed geographically separate from the rest of your gear. Usually, sensors \
    and servers perform a number of clustering operations to optimize resource usage. \
    However, if the sensor is geographically separate, specifically over a low-bandwidth \
    link, you do not want this to happen. By making a sensor a remote sensor Ceph \
    will be disabled, Kafka will not cluster, and the sensor will get its own Zookeeper \
    instance. This generally has negative performance implications, but it's what \
    you want if the sensor is going to be standalone. \n\nREMINDER: If you are using Ceph \
    you'll probably want to adjust the amount of storage you allocate to Moloch based on \
    the number of remote sensors you have. You won't need as much if some of your sensors \
    are writing directly to their disks!"
  , secondary_button_text = 'Is a remote sensor'
  , primary_button_text = 'Is NOT a remote sensor'
  , secondary_button_close = False)

  # This is the form name for the ceph drive list
  sensor_ceph_drive_list = 'sensor_ceph_drive_list_form'

  # This is the form name for the ceph drive list
  pcap_disk_list = 'pcap_disk_list_form'

  # This is the form name for the sensor monitor interface list
  sensor_monitor_interface = 'sensor_monitor_interface_form'

  ###########################
  # Sensor Settings         #
  ###########################

  home_net = Button(
     form_name = 'home_net'
   , label = 'Home Net CIDR IP'
   , button_text = 'Add another'
   , placeholder = "Enter your home net CIDR IP here (or leave it blank)"
   , input_type = 'text'
   , html5_constraint = cidr_constraint
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'You must enter a CIDR IP'
   , required = False
   , description =
   "These are the values Bro and Suricata will use for their home nets. Home Nets \
   are the networks you are trying to protect."
   , reaction_file = 'home_net.js')

  sensor_storage_type = DropDown(
    form_name = 'sensor_storage_type'
  , label = 'Sensor Storage Type'
  #, required = True TODO NEED TO ADD A DEFAULT
  , description =
  "The kit can use two types of storage for PCAP. One is clustered Ceph storage \
  and the other is a disk on the sensor itself. See " + what_is_ceph['label'] + "\
  for a description of Ceph. The advantage to clustered storage \
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
  # WARNING: Do not change the order of these options. There are several parts of the code
  # which depend on them. You can search for them by looking for form.sensor_storage_type.options
  , dropdown_text = 'Storage Type'
  , default_option = 'Use hard drive for PCAP storage')

  submit_sensor_storage_type = GenericButton(
    form_name = 'submit_sensor_storage_type'
    , label = "Click me when you've picked your storage type!"
  )

  submit_sensor_storage_type_modal = ModalPopUp(
    name = 'submit_sensor_storage_type_modal'
  , modal_title = 'Are you sure you want to submit?'
  , modal_text = 'Once you select a storage type you cannot go back without restarting the form.'
  , secondary_button_text = 'Go back'
  , primary_button_text = 'Continue')

  moloch_pcap_folder = Field(
     form_name = 'moloch_pcap_folder'
   , label = 'Moloch PCAP Folder'
   , placeholder = "/pcap"
   , input_type = 'text'
   , html5_constraint = 'pattern=(\\/[\\w]+)+'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'You must enter a valid Linux path. It may not be a hidden folder.'
   , required = True
   , description =
   "This is the folder to which Moloch will write its PCAP data. \
   This must be defined if you are going to use Moloch in direct disk access mode \
   which is the default. We recommend you dedicate a separate disk to PCAP, in which \
   case this will become a mount point. However this can also be a folder. by itself. \
   If you chose to use a separate disk for PCAP you can define that on a per-host \
   basis in the \"Sensor\" section of \"Host Settings\". This will drastically improve \
   system performance."
   , default_value = '/pcap'
   , disabled = True)

  moloch_pcap_storage_percentage = Field(
     form_name = 'moloch_pcap_storage_percentage'
   , label = 'Moloch PCAP Storage Percentage'
   , placeholder = "1"
   , input_type = 'number'
   , html5_constraint = 'min=1 max=99'
   , valid_feedback = 'Input is valid. (This just means you didn\'t type something silly. It doesn\'t necessarily mean you have enough resources.)'
   , invalid_feedback = 'Moloch can\'t run with nothing! (And it should probably be more than 1% ;-D)'
   , required = True
   , description =
   "This is the percentage of the clustered storage which will be assigned to Moloch PCAP. \
   In general, we give this 60% and Elasticsearch 30%, but this depends heavily on \
   the amount of storage you have available. You can play with the values to see what \
   works for you."
   , default_value = '1')

  moloch_pcap_pv = Field(
     form_name = 'moloch_pcap_pv_size'
   , label = 'Moloch PCAP Persistent Volume Size'
   , placeholder = "Size of Moloch PCAP PV"
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'You must allocate at least 1 GB to Moloch\'s PCAP PV'
   , required = True
   , description =
   "See " + what_is_ceph['label'] + " and " + sensor_storage_type.label + " for a good \
   explanation of how Ceph works and what this field does. This is the amount of space \
   you will allocate from the Ceph cluster to Moloch\'s PCAP storage. This is set up on \
   a per instance basis. For example, if you put 8 here, each Moloch instance will receive \
   8 GB to write to."
   , default_value = '0')

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

  moloch_spiDataMaxIndices = Field(
     form_name = 'moloch_spiDataMaxIndices'
   , label = 'Moloch SPI Data Max Indices'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least one.'
   , required = True
   , description =
   "Specify the max number of indices we calculate spidata for. Elasticsearch will \
   blow up if we allow the spiData to search too many indices."
   , default_value = '5')

  moloch_pcapWriteMethod = Field(
     form_name = 'moloch_pcapWriteMethod'
   , label = 'Moloch SPI Data Max Indices'
   , input_type = 'text'
   , required = True
   , description =
   "Specify how packets are written to disk. \
   'simple' = what you should probably use. \
   'simple-nodirect = use this with zfs/nfs. \
   's3' = write packets into s3. \
   'null' = don't write to disk at all."
   , default_value = 'simple')

  moloch_pcapWriteSize = Field(
     form_name = 'moloch_pcapWriteSize'
   , label = 'Moloch PACP Write Size'
   , input_type = 'number'
   , html5_constraint = 'min=4096'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 4096.'
   , required = True
   , description =
   "Buffer size when writing pcap files. Should be a multiple of the raid 5/xfs \
   stripe size and multiple of 4096 if using direct/thread-direct pcapWriteMethod"
   , default_value = '262143')

  moloch_dbBulkSize = Field(
     form_name = 'moloch_dbBulkSize'
   , label = 'Moloch DB Bulk Size'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 1.'
   , required = True
   , description =
   "Size of indexing request to send to Elasticsearch. Increase if monitoring a \
   high bandwidth network."
   , default_value = '20000')

  moloch_maxESConns = Field(
     form_name = 'moloch_maxESConns'
   , label = 'Moloch Maximum ES Connections'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 1.'
   , required = True
   , description =
   "Max number of connections to Elasticsearch from capture process"
   , default_value = '30')

  moloch_maxESRequests = Field(
     form_name = 'moloch_maxESRequests'
   , label = 'Moloch Maximum ES Requests'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 1.'
   , required = True
   , description =
   "Max number of Elasticsearch requests outstanding in queue"
   , default_value = '500')

  moloch_packetsPerPoll = Field(
     form_name = 'moloch_packetsPerPoll'
   , label = 'Moloch Maximum Packets Per Poll'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 1.'
   , required = True
   , description =
   "Number of packets to ask libnids/libpcap to read per poll/spin. Increasing may \
    hurt stats and ES performance. Decreasing may cause more dropped packets"
   , default_value = '50000')

  moloch_magicMode = Field(
     form_name = 'moloch_magicMode'
   , label = 'Moloch Magic Mode'
   , input_type = 'text'
   , required = True
   , description =
   "(since 0.16.1) libfile can be VERY slow. Less accurate \"magicing\" \
   is available for http/smtp bodies. \
   'libmagic' = normal libmagic. \
   'libmagicnotext' = libmagic, but turns off text checks. \
   'molochmagic' = molochmagic implementation (subset of libmagic input files, and less accurate). \
   'basic' = 20 of most common headers. \
   'none' = no libmagic or molochmagic calls."
   , default_value = 'libmagic')

  moloch_maxPacketsInQueue = Field(
     form_name = 'moloch_maxPacketsInQueue'
   , label = 'Moloch Maximum Packets in Queue'
   , input_type = 'number'
   , html5_constraint = 'min=1'
   , valid_feedback = 'Good to go!'
   , invalid_feedback = 'This must be at least 1.'
   , required = True
   , description =
   "See: https://github.com/aol/moloch/wiki/FAQ#why-am-i-dropping-packets"
   , default_value = '200000')

  # Kafka settings

  kafka_jvm_memory = Field(
    form_name = 'kafka_jvm_memory'
  , label = 'Kafka JVM Memory'
  , placeholder = "Kafka JVM Memory in GBs"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "This is the amount of memory which will be allocated to Kafka's JVM instance."
  , default_value = '1')

  kafka_pv_size = Field(
    form_name = 'kafka_pv_size'
  , label = 'Kafka Persistent Volume Size'
  , placeholder = "Storage space in GB per Kafka instance"
  , input_type = 'number'
  , html5_constraint = 'min=3'
  , invalid_feedback = 'You must enter a valid value greater than 3'
  , required = True
  , description =
  "The amount of space to allocate from the Ceph cluster to the persistent volume \
  used per Kafka instance. See " + what_is_ceph['label'] + " for a description \
  of persistent volumes and Ceph."
  , default_value = '3')

  zookeeper_jvm_memory = Field(
    form_name = 'zookeeper_jvm_memory'
  , label = 'Zookeeper JVM Memory'
  , placeholder = "Zookeeper JVM Memory in GBs"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "This is the amount of memory which will be allocated to Zookeeper's JVM instance."
  , default_value = '1')

  zookeeper_pv_size = Field(
    form_name = 'zookeeper_pv_size'
  , label = 'Zookeeper Persistent Volume Size'
  , placeholder = "Storage space in GB per Zookeeper instance"
  , input_type = 'number'
  , html5_constraint = 'min=3'
  , valid_feedback = 'Good to go!'
  , invalid_feedback = 'You must enter a valid value greater than 3'
  , required = True
  , description =
  "The amount of space to allocate from the Ceph cluster to the persistent volume \
  used per Zookeeper instance. See " + what_is_ceph['label'] + " for a description \
  of persistent volumes and Ceph."
  , default_value = '3')

  zookeeper_replicas = Field(
    form_name = 'zookeeper_replicas'
  , label = 'Zookeeper Replicas'
  , placeholder = "Number of Zookeeper instances"
  , input_type = 'number'
  , html5_constraint = 'min=3'
  , invalid_feedback = 'You must enter a valid value greater than 3'
  , required = True
  , description =
  "This is the number of Zookeeper instances your kit will run. These are used for \
  redundancy and load balancing. There isn't much reason to run more than three."
  , default_value = '3')

  use_as_pcap_storage = GenericButton(
    form_name = 'use_as_pcap_storage'
  , label = "Use drive for PCAP storage?"
  , description =
  "Use this field to mark the disk you would like to use for PCAP storage for Moloch.")

  monitor_interface = GenericButton(
    form_name = 'monitor_interface'
  , label = 'Monitor Interface'
  #, required = True TODO NEED TO ADD A DEFAULT
  , description = "The interfaces on the sensor you would like to use for monitoring.\
                   These will be the interfaces that Moloch, Bro, and Suricata use.\
                   Note: The management interface will not appear in this list. You \
                   cannot use an interface for both management and monitoring."
  , callback = 'monitor_interface_callback')

  explanation = " Kubernetes will \
   not cap the performance of the resource at the specified number of cores - it will \
   guarentee that amount of compute resource is available if the application needs it. For example, \
   if Bro were set to 60%, it is guarenteed to have at least 60% of the server available \
   to it. However, if it were only using 30% and something else needed 60%, the other \
   thing would be allowed to infringe on Bro's guarenteed resources. If Bro's needs suddenly grew and it \
   required the compute resources given out to the other thing, Kubernetes would \
   throttle the other thing and Bro would be allowed to burst up to 60% while the other thing \
   would be throttled to whatever its resource request is. Basically, this allows everything \
   to take whatever it needs at any given time if the sensor is not resource constrained. \
   If the sensor becomes resource constrained, each thing will be limited to what it \
   requested. See resource requests: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/ and https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/."

  kafka_cpu_percentage = Field(
    form_name = 'kafka_cpu_percentage'
  , label = 'Kafka CPU Percentage'
  , placeholder = "% of CPUs for Kafka"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , valid_feedback = 'Valid'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "The percentage of the sensor cores which will be allocated to Kafka." + explanation
  , default_value = '13')

  moloch_cpu_percentage = Field(
    form_name = 'moloch_cpu_percentage'
  , label = 'Moloch CPU Percentage'
  , placeholder = "% of CPUs for Moloch"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , valid_feedback = 'Valid'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "The percentage of the sensor cores which will be allocated to moloch." + explanation
  , default_value = '19')

  bro_cpu_percentage = Field(
    form_name = 'bro_cpu_percentage'
  , label = 'Bro CPU Percentage'
  , placeholder = "% of CPUs for Bro"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , valid_feedback = 'Valid'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "The percentage of the sensor cores which will be allocated to Bro." + explanation
  , default_value = '58')

  suricata_cpu_percentage = Field(
    form_name = 'suricata_cpu_percentage'
  , label = 'Suricata CPU Percentage'
  , placeholder = "% of CPUs for Suricata"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , valid_feedback = 'Valid'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "The percentage of the sensor cores which will be allocated to Suricata." + explanation
  , default_value = '6')

  zookeeper_cpu_percentage = Field(
    form_name = 'zookeeper_cpu_percentage'
  , label = 'Zookeeper CPU Percentage'
  , placeholder = "% of CPUs for Zookeeper"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , valid_feedback = 'Valid'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "The percentage of the sensor cores which will be allocated to Zookeeper." + explanation
  , default_value = '3')

  common_settings = [is_offline_build, password, kubernetes_services_cidr]
  advanced_system_settings = [disable_autocalculate, dns_ip]
  server_settings = [server_is_master_server_checkbox, number_of_servers]
  sensor_settings = [number_of_sensors]
  sensor_resource_percentages = [kafka_cpu_percentage, moloch_cpu_percentage, bro_cpu_percentage, suricata_cpu_percentage, zookeeper_cpu_percentage]
  sensor_host_settings= [bro_workers, moloch_threads, monitor_interface]
  elasticsearch_settings = [elastic_cpu_percentage, elastic_memory_percentage, elastic_storage_percentage, logstash_cpu_percentage, logstash_replicas]
  elasticsearch_advanced_settings = [elastic_masters, elastic_datas, elastic_cpus, elastic_memory, elastic_pv_size, elastic_curator_threshold, elastic_cpus_per_instance_ideal, elastic_cpus_to_mem_ratio]
  storage_type_settings = [sensor_storage_type]
  moloch_settings = [moloch_pcap_storage_percentage] # TODO: We should add this back in at some point, moloch_pcap_folder]
  moloch_advanced_settings = [moloch_pcap_pv, moloch_bpf, moloch_dontSaveBPFs, moloch_spiDataMaxIndices, moloch_pcapWriteMethod, moloch_pcapWriteSize, moloch_dbBulkSize, moloch_maxESConns, moloch_maxESRequests, moloch_packetsPerPoll, moloch_magicMode, moloch_maxPacketsInQueue]
  kafka_settings = [kafka_jvm_memory, kafka_pv_size, zookeeper_jvm_memory, zookeeper_pv_size, zookeeper_replicas]

  advanced_settings = advanced_system_settings + elasticsearch_advanced_settings + moloch_advanced_settings + kafka_settings

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
  "Check this if you are setting up your build using the prebuilt offline installer.\
  By default, this should be checked.  If unchecked, this option requires an internet connection.")

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
  , description = "This field is used to identify the starting ip address of the dhcp range.  The dhcp range is only used during the network boot process.\
  The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time. \
  Be sure not to use a range will be cause conflicts with existing network devices.")

  dhcp_end = Field(
    form_name = 'dhcp_end'
  , label = 'DHCP Ending Ip Address'
  , placeholder = "192.168.1.60"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = False
  , description = "This field is used to identify the ending ip address of the dhcp range.  \
  The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time.")

  dns = Field(
    form_name = 'dns'
  , label = 'DNS'
  , placeholder = "192.168.1.1"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "The dns field or Domain Name Resolution is the address used to resolve ip addresses to domain names. \
  During the system installation the dns address should be the ansible controllers ip address unless you are using an external dns server. \
  This field is specifically used as a part of the static interface assignment during the operating system installation.")

  gateway = Field(
    form_name = 'gateway'
  , label = 'Gateway'
  , placeholder = "192.168.1.1"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "The gateway address or default gateway is usually a routable address to the local network.  \
  This field is specifically used as a part of the static interface assignment during the operating system installation.")

  netmask = Field(
    form_name = 'netmask'
  , label = 'Netmask'
  , placeholder = "255.255.255.0"
  , input_type = 'text'
  , html5_constraint = ip_constraint
  , invalid_feedback = 'You must enter a valid IP address.'
  , required = True
  , description = "The netmask is the network address used for subnetting.  \
  This field is specifically used as a part of the static interface assignment during the operating system installation.")

  root_password = Field(
    form_name = 'root_password'
  , label = 'Root Password'
  , placeholder = ""
  , input_type = 'password'
  , html5_constraint = ""
  , invalid_feedback = 'You must enter a root password.'
  , required = True
  , description = "The root password will be how to log into each node after the kickstart process completes.\
  Do not forget this password or you will not be able to complete the system installation.")


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
  , description = "The node ip address is used during the kickstart process to statically assign the node's interface.")

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
  , description = "The mac address is the network interface's physical  address.  \
  This address is used by the dhcp server to provide the node a specific pxe file used for network booting.\
  If the mac address is incorrect the node will be able to network boot.")

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
  , description = "The boot drive is the disk name that will have the operating system installed during the kickstart process.  \
  By default, the Supermicro will use sda and the HP DL160 will use sdb.")

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
  , description = "The hostname is the nodes name that will be assigned during the installation of the operating system.  This should match the hostname used by the DNS server.")

  pxe_type = DropDown(
      form_name = 'pxe_type'
    , label = 'PXE Type'
    #, required = True TODO NEED TO ADD A DEFAULT
    , description = "The PXE Type referes to the motherboards method of network booting.  \
    By default, the Supermicro uses BIOS and the HP DL160s use UEFI.\
    BIOS is sometimes called Legacy in the bios settings."
    , options = ['BIOS', 'UEFI']
    # WARNING: Do not change the order of these options. There are several parts of the code
    # which depend on them. You can search for them by looking for form.sensor_storage_type.options
    , dropdown_text = 'PXE Type'
    , default_option = 'BIOS')

  timezone = DropDown(
      form_name = 'timezone'
    , label = 'Timezone'
    #, required = True TODO NEED TO ADD A DEFAULT
    , description = "This option is sets each node's timezone during the kickstart provisioning process (Automated Operating System installation)."
    , options = ['Chicago', 'Los_Angeles', 'New_York', 'UTC']
    # WARNING: Do not change the order of these options. There are several parts of the code
    # which depend on them. You can search for them by looking for form.sensor_storage_type.options
    , dropdown_text = 'Timezone'
    , default_option = 'Chicago')

  repo_sync_centos = CheckBox(
    form_name = "repo_sync_centos"
  , label = "CentOS"
  , description =
  "This options is used to download the public centos yum repositories to the ansible controller.  \
  This option requires an internet connection.")

  repo_sync_rhel = CheckBox(
    form_name = "repo_sync_rhel"
  , label = "RHEL"
  , description =
  "This options is used to download the required Red Hat Enterprise Linux(RHEL) 7 yum repositories to the ansible controller.\
  This option requires an internet connection and a RHEL subscription.")

  repo_sync_additional = CheckBox(
    form_name = "repo_sync_additional"
  , label = "Additional (EPEL, RockNSM, Ceph, Kubernetes)"
  , description =
  "This options is used to download the public EPEL, kubernetes, RockNSM, and Ceph yum repositories to the ansible controller.\
  This option requires an internet connection.")

  kickstart_form_settings = [dhcp_start, dhcp_end, dns, gateway, netmask, root_password,
  pxe_type, number_of_nodes, hostname, ip_address, mac_address, boot_drive,
  pxe_type, timezone, is_offline_build, repo_sync_centos, repo_sync_rhel,
  repo_sync_additional]
