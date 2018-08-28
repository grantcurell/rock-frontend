import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ValidateKickStartInventoryForm } from './kickstart-form-validation';
import { IP_CONSTRAINT, URL_CONSTRAINT, IP_CONSTRAINT_WITH_SUBNET, DESC_ROOT_PASSWORD, INVALID_FEEDBACK_IP } from '../frontend-constants';
import { HtmlInput, HtmlDropDown, HtmlCheckBox, GenericHtmlButton, HtmlCardSelector } from '../html-elements';

export class NodeFormGroup extends FormGroup {
  public hidden: boolean;

  constructor(hidden: boolean) {
    super({});
    super.addControl('hostname', this.hostname);
    super.addControl('ip_address', this.ip_address);
    super.addControl('mac_address', this.mac_address);
    super.addControl('boot_drive', this.boot_drive);
    super.addControl('pxe_type', this.pxe_type);
    super.addControl('node_type', this.node_type);
    this.hidden = hidden;
  }

  /**
   * Overridden method
   */
  reset(value?: any, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    super.reset({'pxe_type': this.pxe_type.default_value,
                 'node_type': this.node_type.default_value
    });
  }

  hostname = new HtmlInput(
    'hostname',
    'Hostname',
    "Enter a node hostname ending with .lan",
    'text',
    "(.*\\.lan$)",
    'You must enter a valid hostname ending with .lan',
    true,
    '',
    "The hostname is the nodes name that will be assigned during the installation of the operating system.  \
      This should match the hostname used by the DNS server.",
  )

  ip_address = new HtmlInput(
    'ip_address',
    'IP Address',
    "Enter your node IP address here",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    true,
    '',
    "The node ip address is used during the kickstart process to statically assign the node's interface."
  )

  mac_address = new HtmlInput(
    'mac_address',
    'MAC Address',
    "Enter a mac address",
    'text',
    '^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$',
    'You must enter a valid mac address',
    true,
    '',
    "The mac address is the network interface's physical  address.  \
       This address is used by the dhcp server to provide the node a specific pxe file used for network booting.\
       If the mac address is incorrect the node will be able to network boot."
  )

  boot_drive = new HtmlInput(
    'boot_drive',
    'Boot Drive',
    "Enter a boot drive for example: sda",
    'text',
    "",
    '',
    true,
    '',
    "The boot drive is the disk name that will have the operating system installed during the kickstart process.  \
       By default, the Supermicro will use sda and the HP DL160 will use sdb."
  )

  pxe_type = new HtmlDropDown(
    'pxe_type',
    'PXE Type',
    ['BIOS', 'UEFI'],
    "The PXE Type referes to the motherboards method of network booting.  \
       By default, the Supermicro uses BIOS and the HP DL160s use UEFI.\
       BIOS is sometimes called Legacy in the bios settings.",
    'BIOS'
  )

  node_type = new HtmlDropDown(
    'node_type',
    'Node Type',
    ['Server', 'Sensor'],
    "The Node Type referes to whether or not the node is a server or a sensor.  A server will run TODO...",
    'Server'
  )
}

export class AdvancedSettingsFormGroup extends FormGroup {

  constructor(public hidden: boolean) {
    super({});
    super.addControl('timezone', this.timezone);
    super.addControl('os_name', this.os_name);
    super.addControl('iso_url', this.iso_url);
    super.addControl('iso_path', this.iso_path);
    super.addControl('iso_checksum', this.iso_checksum);
    super.addControl('is_offline_build', this.is_offline_build);
    super.addControl('download_dependencies', this.download_dependencies);
  }

  /**
   * Overridden method for form reset functionality.
   * 
   * @param value 
   * @param options 
   */
  reset(value?: any, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{    
    super.reset({'iso_url': this.iso_url.default_value,
                 'iso_path': this.iso_path.default_value,
                 'iso_checksum': this.iso_checksum.default_value
    });
  }

  timezone = new HtmlDropDown(
    'timezone',
    'Timezone',
    ['Chicago', 'Los_Angeles', 'New_York', 'UTC'],
    "This option is sets each node's timezone during the kickstart provisioning process (Automated Operating System installation).",
    'Chicago'
  )

  os_name = new HtmlDropDown(
    'os_name',
    'Operating System',
    ['centos', 'rhel', 'coreos', 'atomic'],
    "This option is used to determine which operating system will be installed on each node.  By default the tfplenum should use centos.",
    'centos'
  )

  iso_url = new HtmlInput(
    'iso_url',
    'ISO URL',
    "Path to centos/rhel iso url",
    'text',
    URL_CONSTRAINT,
    'You must enter a valid URL for centos/rhel minimal iso ending with .iso',
    false,
    "http://mirrors.mit.edu/centos/7/isos/x86_64/CentOS-7-x86_64-Minimal-1804.iso",
    "This is the url to download the centos/rhel minimal installation iso.  \
      If the iso is already on the controller provide disregard this option.  Verify the ISO Path Location is the correct.",
    undefined,
    true
  )

  iso_path = new HtmlInput(
    'iso_path',
    'ISO Path Location',
    "Path to centos/rhel iso",
    'text',
    ".*\\.iso$",
    'You must enter a valid path to a centos/rhel iso.',
    false,
    "/root/CentOS-7-x86_64-Minimal-1804.iso",
    "This should be the path of the iso for centos/rhel minimal installation.  \
      The iso is downloaded manually or automatically if a valid ISO URL is provided (requires internet connection)."
  )

  iso_checksum = new HtmlInput(
    'iso_checksum',
    'ISO Checksum',
    "Enter sha256 checksum for the Centos/Rhel iso",
    'text',
    "[A-Fa-f0-9]{64}",
    'You must enter the sha256 checksum for the centos/rhel iso',
    true,
    "714acc0aefb32b7d51b515e25546835e55a90da9fb00417fbee2d03a62801efd",
    "This is the checksum for the centos/rhel iso. This is required to verify validity of the iso."
  )

  is_offline_build = new HtmlCheckBox(
    "is_offline_build",
    "Is offline build?",
    "Check this if you are setting up your build using the prebuilt offline installer. \
      This is the installer on the control server shipped to you from the PMO. If you \
      uncheck this, it is expected that all boxes have access to commercial internet. \
      The online build will pull everything required from the Internet instead of the \
      controller. Use this if you are building the system at home.",
    false,
    true
  )

  download_dependencies = new HtmlCheckBox(
    "download_dependencies",
    "Download All Dependencies (requires internet connection)",
    "This options is used to download the required dependencies to be hosted on the \
      controller for deployment of the system.  Dependancies include yum repositories, \
      pip and nmp modules and docker images.",
    true,
    false
  )
}

export class NodesFormArray extends FormArray {
  constructor(controls: AbstractControl[],
    public hidden: boolean) {
    super(controls);
  }
}

export class KickstartInventoryForm extends FormGroup {
  nodes: NodesFormArray;
  interfaceSelections: Array<{value: string, label: string}>;

  constructor() {
    super({}, ValidateKickStartInventoryForm);
    super.addControl('dhcp_start', this.dhcp_start);
    super.addControl('dhcp_end', this.dhcp_end);
    super.addControl('gateway', this.gateway);
    super.addControl('netmask', this.netmask);
    super.addControl('root_password', this.root_password);
    super.addControl('re_password', this.re_password);
    
    super.addControl('controller_interface', this.controller_interface);    
    this.nodes = new NodesFormArray([], true);
    super.addControl('nodes', this.nodes);
    super.addControl('advanced_settings', this.advanced_settings);
    this.interfaceSelections = new Array();
  }

  public setInterfaceSelections(deviceFacts: Object){
    for (let item of deviceFacts["interfaces"]){
      this.interfaceSelections.push({value: item["ip_address"], label: item["name"] + ' - ' + item["ip_address"] });
    }
  }

  public clearNodes() {
    while (this.nodes.length !== 0) {
      this.nodes.removeAt(0);
    }
  }

  public addNodeGroup(hidden: boolean = false, arrayFormHidden: boolean = false) {
    this.nodes.hidden = arrayFormHidden;
    this.nodes.push(new NodeFormGroup(hidden));
  }

  /**
   * Overridden method
   */
  reset(value?: any, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    console.log("Reset");
    super.reset({'advanced_settings.iso_url': this.advanced_settings.iso_url.default_value, 
                 'netmask': this.netmask.default_value });
  }

  advanced_settings = new AdvancedSettingsFormGroup(true);

  dhcp_start = new HtmlInput(
    'dhcp_start',
    'DHCP Starting Ip Address',
    'The beginning of your DHCP start range',
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    false,
    "",
    "This field is used to identify the starting ip address of the dhcp range.  The dhcp range is only used during the network boot process.\
    The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time. \
    Be sure not to use a range will be cause conflicts with existing network devices.")

  dhcp_end = new HtmlInput(
    'dhcp_end',
    'DHCP Ending Ip Address',
    "The end of your DHCP range",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    false,
    "",
    "This field is used to identify the ending ip address of the dhcp range.  \
      The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time.")

  gateway = new HtmlInput(
    'gateway',
    'Gateway',
      "Enter your kit's gateway here",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    true,
    "",
    "The gateway address or default gateway is usually a routable address to the local network.  \
      This field is specifically used as a part of the static interface assignment during the operating system installation.")

  netmask = new HtmlInput(
    'netmask',
    'Netmask',
    "255.255.255.0",
    'text',
    IP_CONSTRAINT_WITH_SUBNET,
    'Please enter a valid Netmask.',
    true,
    "255.255.255.0",
    "The netmask is the network address used for subnetting.  \
      This field is specifically used as a part of the static interface assignment during the operating system installation.")

  root_password = new HtmlInput(
    'root_password',
    'Root Password',
    '',
    'password',
    '^.{6,}$',
    'You must enter a root password with a minimum length of 6 characters.',
    true,
    '',
    DESC_ROOT_PASSWORD)

  re_password = new HtmlInput(
    're_password',
    'Retype Password',
    '',
    'password',
    '^.{6,}$',
    'You must re-enter the root password.',
    true,
    '',
    DESC_ROOT_PASSWORD
  )

  controller_interface = new HtmlCardSelector (
    'controller_interface',
    "Controller Interface",      
    "The interfaces on the controller you would like to use.",
    "Select which interface you would like to use as the controller interface. This will be the interface used for services provided to the kit.",
    "Warning: Interfaces without IP addresses will not be listed!",
    "No interfaces found! Are you sure you have a second eligible interface that is not the management interface?",
    false
  )

}