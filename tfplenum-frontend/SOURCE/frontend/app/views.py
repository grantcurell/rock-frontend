# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from api.node_facts import *
from app.forms import InventoryForm, DropDown
import json
import yaml

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

    print node.cpu_cores

    return jsonify(cpus_available=node.cpu_cores,
                   memory_available=node.memory_gb,
                   disks= json.dumps([disk. __dict__ for disk in node.disks]),
                   hostname=node.hostname,
                   potential_monitor_interfaces=potential_monitor_interfaces)

@app.route('/_display_monitor_interfaces')
def _display_monitor_interfaces():

    form = InventoryForm()

    instance_number = request.args.get('instance_number')
    interfaces = json.loads(request.args.get('interfaces'))

    object = DropDown(
    form_name = form.monitor_interface.form_name + "_" + instance_number
    , label = form.monitor_interface.label
    #, required = True TODO NEED TO ADD A DEFAULT
    , description = form.monitor_interface.description
    , options = interfaces
    , dropdown_text = form.monitor_interface.dropdown_text
    , callback = form.monitor_interface.callback + "_" + i)

    return render_template("dropdown.html", object=object, form=form)

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

    # This is here so you can reuse the code in ceph_disk_list. It will be true
    # if the entity sending the request is a server and false if it is a sensor
    if request.args.get('isServer') == "True":
        device_type = 'server'
    else:
        device_type = 'sensor'

    form = InventoryForm()
    return render_template("ceph_disk_list.html", form=form, device_number=device_number, disks=disks, device_type=device_type)

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

    form = InventoryForm()
    return render_template("pcap_disks_list.html", form=form, device_number=device_number, disks=disks)

@app.route('/_generate_inventory')
def _generate_inventory():
    """
    with open("/root/tfplenum/playbooks/inventory/sample/inventory.yml", 'r') as yaml_stream, file("/root/tfplenum/playbooks/inventory/output.yml", 'w') as output:
        try:
            data = yaml.load(yaml_stream)
            yaml.dump(data, output, default_flow_style=False)
        except yaml.YAMLError as error:
            print error
    """
    #render_template('inventory_template.yml')
    return "bullshit"

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
