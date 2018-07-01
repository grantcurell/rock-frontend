# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from api.node_facts import *
from app.forms import InventoryForm, DropDown
from app.inventory_classes import Sensor, Server
import json

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

@app.route('/_gather_device_facts')
def _gather_device_facts():
    # This request wil be received from jquery on the client side
    management_ip = request.args.get('management_ip')
    node = get_system_info(management_ip, 'I.am.ghost.47')
    potential_monitor_interfaces = []

    for interface in node.interfaces:
        if interface.ip_address != management_ip:
            potential_monitor_interfaces.append(interface.name)

    return jsonify(cpus_available=node.cpu_cores,
                   memory_available=node.memory_gb,
                   disks= json.dumps([disk. __dict__ for disk in node.disks]),
                   hostname=node.hostname,
                   potential_monitor_interfaces=potential_monitor_interfaces)

@app.route('/_display_monitor_interfaces')
def _display_monitor_interfaces():

    form = InventoryForm()

    device_number = request.args.get('instance_number')
    interfaces = json.loads(request.args.get('interfaces'))
    hostname = request.args.get('hostname')

    form = InventoryForm()
    return render_template("monitor_interfaces.html", form=form, device_number=device_number, interfaces=interfaces, device_type="sensor", hostname=hostname)

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

@app.route('/_generate_inventory')
def _generate_inventory():

    form = InventoryForm();

    input_data = json.loads(request.args.get('input_data'))
    hosts = json.loads(request.args.get('hosts'))

    servers = {}
    sensors = {}
    remote_sensors = {}
    master_server = None
    use_ceph_for_pcap = False
    form = InventoryForm

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
                    if value and not drive_name in type_of_sensor[host].ceph_drive_list:
                        type_of_sensor[host].ceph_drive_list.append(drive_name)
                for interface, value in attributes["monitor_interfaces"].iteritems():
                    if value and not interface in type_of_sensor[host].sensor_monitor_interfaces:
                        type_of_sensor[host].sensor_monitor_interfaces.append(interface)
                for drive_name, value in attributes["pcap_drives"].iteritems():
                    if value:
                        type_of_sensor[host].pcap_disk = drive_name
                        # TODO - these lines will probably need to be updated
                        use_ceph_for_pcap = False
                    else:
                        use_ceph_for_pcap = True
            if not "is_remote_sensor_checkbox" in attributes:
                attributes["is_remote_sensor_checkbox"] = False
            if attributes["is_remote_sensor_checkbox"]:
                _assign_sensor(remote_sensors)
            else:
                _assign_sensor(sensors)

    inventory_template = render_template('inventory_template.yml', form=form, input_data=input_data, sensors=sensors, remote_sensors=remote_sensors, master_server=master_server, servers=servers, use_ceph_for_pcap=use_ceph_for_pcap)
    #print inventory_template

    # to save the results
    with open("/root/inventory.yml", "w") as inventory_file:
        inventory_file.write(inventory_template)

    return "Finished"

@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/kit_configuration', methods=['GET', 'POST'])
def kit_configuration():
    form = InventoryForm()
    return render_template('kit_inventory.html', title='Configure Inventory', form=form)

@app.route('/help')
def help():
    form = InventoryForm()
    return render_template("help.html", form=form)
