import copy

# https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
# form_name (str): The name which will be applied to the form in which this field is placed
# label (str): The label which will be applied to the field. Ex: Number of Sensors
# html5_constrant: See https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
# valid_feedback (str): The message to display when the user types something which
#                       meets the above defined validation constraint
# invalid_feedback (str): The message tobe displayed when the constraint is not met
# required (bool): Whether the field is or is not required
# description (str): The description which you would like to appear in the help page
# placeholder (str): The placeholder text which will appear inside of the field
# input_type: See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
class Field:
    def __init__(self, form_name, label, html5_constraint=None, valid_feedback='Good to go!',
                 invalid_feedback='This is not a valid value.', required=False, description=None, placeholder=None,
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
    def __init__(self, form_name, label, description=None):
        self.form_name = form_name
        self.generic_button_id = form_name + '_generic_button'
        self.css_class = form_name + '_generic_button_class'
        self.label = label
        self.description = description

class CheckBox:
    def __init__(self, form_name, label, description=None):
        self.form_name = form_name
        self.checkbox_id = form_name + '_checkbox'
        self.css_class = form_name + '_checkbox_class'
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

        # This is the HTML file generally associated with displaying this field.
        # You don't have to use this, but it is handy for displaying things in a loop.
        self.include_html = "dropdown.html"

class InventoryForm:

  ip_constraint = 'pattern=((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$'

  navbar_elements = {
    'Kit Configuration': 'kit_configuration'
  , 'Help': 'help'
  }

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

  ###########################
  # Common Settings         #
  ###########################

  dns_ip = Field(
    form_name = 'dns_ip'
  , label = 'DNS IP Address'
  , placeholder = "192.168.1.50"
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

  kubernetes_services_cidr = Field(
    form_name = 'kubernetes_services_cidr'
  , label = 'Kubernetes Service CIDR'
  , placeholder = "192.168.1.16/28"
  , input_type = 'text'
  # See: https://stackoverflow.com/questions/34758562/regular-expression-how-can-i-match-all-numbers-less-than-or-equal-to-twenty-fo
  # for a good explanation of this type of regex. I got the original code from: https://gist.github.com/nikic/4162505
  , html5_constraint = 'pattern=(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/28'
  , invalid_feedback = 'You must enter a valid IP address with a CIDR mask of /28.'
  , required = False
  , description =
  "Services_cidr is the range of addresses kubernetes will use for external services \
   This includes cockpit, Moloch viewer, Kibana, elastichq, kafka-manager, and the \
   kubernetes dashboard. This range must be at least a /28. Ex: \"192.168.1.16/28\" \
   Keep in mind, the only thing this does is provide a valid set of IPs for the services \
   to use. This isn't like a regular netmask that has a broadcast address and a network \
   address.")

  ###########################
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
   "The number of Elasticsearch masters you would like to run on your kit.\
   Unless you are going to exceed 5 Elasticsearch nodes, you should run masters instead \
   of data instances.")

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
   tself. Good values depend very heavily on the type of traffic that the system runs and developing \
   good predictive models of what work is one of the more challenging engineering problems\
   that exists. We generally recommend you stick with the recommended default. If you \
   know what you are doing, you might try experimenting with this value.")

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
   of persistent volumes and Ceph.")

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
  , valid_feedback = 'Looks good! Now hit \"Gather Facts\"!'
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

  monitor_interface = DropDown(
    form_name = 'monitor_interface'
  , label = 'Monitor Interface'
  #, required = True TODO NEED TO ADD A DEFAULT
  , description = "The interface on the sensor you would like to use for monitoring.\
                   This will be the interface that Moloch, Bro, and Suricata use."
  , options = []
  , dropdown_text = 'Monitor Interface')

  # This is the form name for the ceph drive list
  ceph_drive_list = 'sensor_ceph_drive_list_form'

  # This is the form name for the sensor monitor interface list
  sensor_monitor_interface = 'sensor_monitor_interface_form'

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
   #, html5_constraint = 'pattern=(\/[\w^ ]+)+\/?'
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
  "This is the amount of memory which will be allocated to Kafka's JVM instance.")

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
  of persistent volumes and Ceph.")

  zookeeper_jvm_memory = Field(
    form_name = 'zookeeper_jvm_memory'
  , label = 'Zookeeper JVM Memory'
  , placeholder = "Zookeeper JVM Memory in GBs"
  , input_type = 'number'
  , html5_constraint = 'min=1'
  , invalid_feedback = 'You must enter a valid value greater than 1'
  , required = True
  , description =
  "This is the amount of memory which will be allocated to Zookeeper's JVM instance.")

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
  of persistent volumes and Ceph.")

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
  redundancy and load balancing. There isn't much reason to run more than three.")

  common_settings = [kubernetes_services_cidr]
  advanced_settings = [dns_ip]
  server_settings = [server_is_master_server_checkbox, number_of_servers]
  sensor_settings = [number_of_sensors]
  sensor_host_settings= [bro_workers, moloch_threads, monitor_interface]
  elasticsearch_settings = [elastic_masters, elastic_memory, elastic_pv_size]
  moloch_settings = [sensor_storage_type, moloch_pcap_folder]
  moloch_advanced_settings = [moloch_bpf, moloch_dontSaveBPFs]
  kafka_settings = [kafka_jvm_memory, kafka_pv_size, zookeeper_jvm_memory, zookeeper_pv_size, zookeeper_replicas]
