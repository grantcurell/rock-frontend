# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from api.node_facts import *
from app.forms import InventoryForm, KickstartInventoryForm, ErrorForm
from app.inventory_classes import Sensor, Server, Node
import json
import os
import traceback

@app.route('/_server')
def _server():
    # This request wil be received from jquery on the client side
    server_count = request.args.get('server_count', 0, type=int)
    form = InventoryForm()
    return render_template("server.html", form=form, server_count=server_count)

@app.route('/_sensor')
def _sensor():
    # This request wil be received from jquery on the client side
    sensor_count = request.args.get('sensor_count', 0, type=int)
    form = InventoryForm()
    return render_template("sensor.html", form=form, sensor_count=sensor_count)

@app.route('/_node')
def _node():
    # This request wil be received from jquery on the client side
    node_count = request.args.get('node_count', 0, type=int)
    form = KickstartInventoryForm()
    return render_template("node.html", form=form, node_count=node_count)

@app.route('/_gather_device_facts')
def _gather_device_facts():
    # This request will be received from jquery on the client side
    try:
        min_mbps = 1000        
        management_ip = request.args.get('management_ip')
        password = request.args.get('password')
        node = get_system_info(management_ip, password)
        potential_monitor_interfaces = []

        for interface in node.interfaces:
            if interface.ip_address != management_ip:
                potential_monitor_interfaces.append(interface.name)            
            if interface.ip_address == management_ip:
                if interface.speed < min_mbps:
                    return jsonify(error_message="ERROR: Please check your "
                                  "network configuration. The link speed on {} is less than {} Mbps."
                                  .format(interface.name, min_mbps))

        return jsonify(cpus_available=node.cpu_cores,
                       memory_available=node.memory_gb,
                       disks= json.dumps([disk. __dict__ for disk in node.disks]),
                       hostname=node.hostname,
                       potential_monitor_interfaces=potential_monitor_interfaces,
                       # This for loop takes the list of interface objects (interfaces) and converts the list to json also known as serialization.
                       # json.dumps is not able to serialize a list of objects.  Using the __dict__ converts each interface object to a dict object first during the for loop
                       interfaces=json.dumps([interface. __dict__ for interface in node.interfaces]))
    except Exception as e:
        #TODO Add logging later
        traceback.print_exc()
        return jsonify(error_message=str(e))

@app.route('/_render_home_net')
def _render_home_net():

    # This request wil be received from jquery on the client side
    home_net_count = request.args.get('home_net_count')

    form = InventoryForm()

    # We have to modify the button returned to include a unique ID. In this case
    # we are using the number of home net fields to generate the unique ID for each
    # button
    object = form.home_net.change_values((form.home_net.form_name + "_" + home_net_count), (form.home_net.field_id + "_" + home_net_count), (form.home_net.button_id + "_" + home_net_count));

    return render_template("button.html", object=object, form=form)

@app.route('/_display_monitor_interfaces')
def _display_monitor_interfaces():

    form = InventoryForm()

    device_number = request.args.get('instance_number')
    interfaces = json.loads(request.args.get('interfaces'))
    hostname = request.args.get('hostname')

    form = InventoryForm()
    return render_template("monitor_interfaces.html", form=form, device_number=device_number, interfaces=interfaces, device_type="sensor", hostname=hostname)

@app.route('/_display_controller_interfaces')
def _display_controller_interfaces():
    # This request will be received from jquery on the client side
    try:
        form = KickstartInventoryForm()
        device_number = request.args.get('instance_number')
        interfaces = json.loads(request.args.get('interfaces'))
        hostname = request.args.get('hostname')

        for interface in interfaces:
            if not interface["ip_address"]:
                interfaces.remove(interface)

        return render_template("controller_interfaces.html", form=form, device_number=device_number, interfaces=interfaces, device_type="controller", hostname=hostname)
    except Exception as e:
        #TODO Add logging later
        traceback.print_exc()
        return jsonify(error_message=str(e))

@app.route('/_ceph_drives_list')
def _ceph_drives_list():

    # This request wil be received from jquery on the client side
    device_number = request.args.get('device_number')
    # json.loads takes the json we received and converts it to a python dict
    # Ex, the JSON looks like: [{u'size_gb': 20.0, u'name': u'sdb', u'size_tb': 0.01953125}, {u'size_gb': 20.0, u'name': u'sda', u'size_tb': 0.01953125}]
    # While this looks like a dictionary, it is actually just a  string. json loads
    # makes it a dictionary we can operate on.
    disks = json.loads(request.args.get('disks'))

    for disk in disks:
        if disk['hasRoot']:
            disks.pop(disks.index(disk))

    hostname = request.args.get('hostname')

    # This is here so you can reuse the code in ceph_disk_list. It will be true
    # if the entity sending the request is a server and false if it is a sensor
    if request.args.get('isServer') == "True":
        device_type = 'server'
    else:
        device_type = 'sensor'

    form = InventoryForm()
    return render_template("ceph_disk_list.html", form=form, device_number=device_number, disks=disks, device_type=device_type, hostname=hostname)

@app.route('/_pcap_disks_list')
def _pcap_disks_list():

    # This request wil be received from jquery on the client side
    device_number = request.args.get('device_number')
    # json.loads takes the json we received and converts it to a python dict
    # Ex, the JSON looks like: [{u'size_gb': 20.0, u'name': u'sdb', u'size_tb': 0.01953125}, {u'size_gb': 20.0, u'name': u'sda', u'size_tb': 0.01953125}]
    # While this looks like a dictionary, it is actually just a  string. json loads
    # makes it a dictionary we can operate on.
    disks = json.loads(request.args.get('disks'))

    for disk in disks:
        if disk['hasRoot']:
            disks.pop(disks.index(disk))

    hostname = request.args.get('hostname')

    form = InventoryForm()
    return render_template("pcap_disks_list.html", form=form, device_number=device_number, disks=disks, hostname=hostname)


def _change_zookeeper_replicas_based_on_node_count(input_data, form):
    """
    Changes the zookeeper replica count to 1 if there is less than 3 nodes.
    Otherwise the value passed in is unchanged.

    :param input_data: A python dictionary object that contains
                     the form data submitted from the kit_configuration page
    :param form: The form object that pertains to the view in question.
    :return: None
    """
    node_count = int(input_data["number_of_sensors_field"]) + int(input_data["number_of_servers_field"])
    if node_count < 3:
        input_data[form.zookeeper_replicas.field_id] = u'1'


@app.route('/_generate_inventory')
def _generate_inventory():
    form = InventoryForm()
    input_data = json.loads(request.args.get('input_data'))
    hosts = json.loads(request.args.get('hosts'))

    servers = {}
    sensors = {}
    remote_sensors = {}
    master_server = None
    use_ceph_for_pcap = False
    form = InventoryForm
    input_data[form.kubernetes_services_cidr.field_id] = input_data[form.kubernetes_services_cidr.field_id] + "/28"

    if form.sensor_storage_type.dropdown_id in input_data:
        # Remove the dropdown name from the value (sensor_storage_type_dropdown_)
        tmp = input_data[form.sensor_storage_type.dropdown_id].replace("sensor_storage_type_dropdown_","")
        if tmp == form.sensor_storage_type.options[0].replace(" ", "_"):
            use_ceph_for_pcap = True
        else:
            use_ceph_for_pcap = False

            # If we are not using Ceph for PCAP the PCAP PV size should be 0
            input_data[form.moloch_pcap_pv] = 0
    else:
        use_ceph_for_pcap = False

    for host, attributes in hosts.iteritems():
        # This is purely a convienience function. Master server and servers
        # are identical aside from their type and this just makes it so you
        # don't have unnecessary code duplication
        if attributes["is_server"]:
            if not form.server_is_master_server_checkbox.field_id in attributes:
                attributes[form.server_is_master_server_checkbox.field_id] = False
            if attributes[form.server_is_master_server_checkbox.field_id]:
                master_server = Server()
                master_server.hostname = host
                master_server.management_ipv4 = attributes["management_ip"]
                for drive_name, value in attributes["ceph_drives"].iteritems():
                    if value and not drive_name in master_server.ceph_drive_list:
                        master_server.ceph_drive_list.append(drive_name)
            else:
                servers[host] = Server()
                servers[host].hostname = host
                servers[host].management_ipv4 = attributes["management_ip"]
                for drive_name, value in attributes["ceph_drives"].iteritems():
                    if value and not drive_name in servers[host].ceph_drive_list:
                        servers[host].ceph_drive_list.append(drive_name)
        else:
            # This is purely a convienience function. Remote sensors and sensors
            # are identical aside from their type and this just makes it so you
            # don't have unnecessary code duplication
            def _assign_sensor(type_of_sensor):
                type_of_sensor[host] = Sensor()
                type_of_sensor[host].hostname = host
                type_of_sensor[host].management_ipv4 = attributes["management_ip"]
                type_of_sensor[host].bro_workers = attributes["bro_workers"]
                type_of_sensor[host].moloch_threads = attributes["moloch_threads"]
                for drive_name, value in attributes["ceph_drives"].iteritems():

                    # This condition may seem a bit unintuitive - it's just there
                    # to make sure duplicates don't make it in. It's the same for
                    # the other conditions with the same structure.
                    if value and not drive_name in type_of_sensor[host].ceph_drive_list:
                        type_of_sensor[host].ceph_drive_list.append(drive_name)
                for interface, value in attributes["monitor_interfaces"].iteritems():
                    if value and not interface in type_of_sensor[host].sensor_monitor_interfaces:
                        type_of_sensor[host].sensor_monitor_interfaces.append(interface)
                for drive_name, value in attributes["pcap_drives"].iteritems():
                    if value:
                        type_of_sensor[host].pcap_disk = drive_name
            if attributes["is_remote_sensor"]:
                _assign_sensor(remote_sensors)
            else:
                _assign_sensor(sensors)

    _change_zookeeper_replicas_based_on_node_count(input_data, form)
    input_data[form.moloch_pcap_pv.field_id] = int(input_data[form.moloch_pcap_pv.field_id])
    inventory_template = render_template('inventory_template.yml', form=form, input_data=input_data,
                                         sensors=sensors, remote_sensors=remote_sensors,
                                         master_server=master_server,
                                         servers=servers, use_ceph_for_pcap=use_ceph_for_pcap)

    if not os.path.exists("/opt/tfplenum/playbooks/"):
        os.makedirs("/opt/tfplenum/playbooks/")

    # to save the results
    with open("/opt/tfplenum/playbooks/inventory.yml", "w") as inventory_file:
        inventory_file.write(inventory_template)

    return "Finished"

@app.route('/_generate_kickstart_inventory')
def _generate_kickstart_inventory():
    system_settings = json.loads(request.args.get('system_settings'))
    hosts = json.loads(request.args.get('hosts'))
    nodes = {}
    for host, value in hosts.iteritems():
        nodes[host] = Node()
        nodes[host].hostname = host
        nodes[host].ip_address = value["ip"]
        nodes[host].mac_address = value["mac"]
        nodes[host].boot_drive = value["boot_drive"]
        nodes[host].pxe_type = value["pxe_type"]

    inventory_template = render_template('kickstart_inventory.yml', system_settings=system_settings, nodes=nodes)

    if not os.path.exists("/opt/tfplenum-deployer/playbooks/"):
        os.makedirs("/opt/tfplenum-deployer/playbooks/")

    # # to save the results
    with open("/opt/tfplenum-deployer/playbooks/inventory.yml", "w") as inventory_file:
        inventory_file.write(inventory_template)

    return "Finished"

@app.route('/kit_configuration', methods=['GET', 'POST'])
def kit_configuration():
    form = InventoryForm()
    return render_template('kit_inventory.html', title='Configure Inventory', form=form)

@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/kickstart', methods=['GET', 'POST'])
def kickstart():
    form = KickstartInventoryForm()
    return render_template('kickstart.html', title='Configure Inventory', form=form)

@app.route('/help')
def help():
    form = InventoryForm()
    kickstart_form = KickstartInventoryForm()
    return render_template("help.html", form=form, kickstart_form=kickstart_form)

@app.route('/error')
def error():
    form = ErrorForm("Browser Error! Google Chrome is the only supported browser.")
    return render_template("error.html", form=form)
