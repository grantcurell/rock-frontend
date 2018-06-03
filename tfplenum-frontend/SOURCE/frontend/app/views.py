# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from api.node_facts import *
from app.forms import InventoryForm, HelpPage
import json

@app.route('/_server')
def _server():
    # This request wil be received from jquery on the client side
    server_count = request.args.get('server_count', 0, type=int)
    form = InventoryForm()
    return render_template("server.html", form=form, server_count=server_count)

@app.route('/_gather_server_facts')
def _gather_server_facts():
    # This request wil be received from jquery on the client side
    server_management_ip = request.args.get('management_ip')
    node = get_system_info(server_management_ip, 'I.am.ghost.47')
    return jsonify(cpus_available=node.cpu_cores,
                   memory_available=node.memory_gb,
                   disks= json.dumps([disk. __dict__ for disk in node.disks]),
                   hostname=node.hostname)

@app.route('/_ceph_drives_list')
def _ceph_drives_list():

    # This request wil be received from jquery on the client side
    device_count = request.args.get('device_count')
    # json.loads takes the json we received and converts it to a python dict
    # Ex, the JSON looks like: [{u'size_gb': 20.0, u'name': u'sdb', u'size_tb': 0.01953125}, {u'size_gb': 20.0, u'name': u'sda', u'size_tb': 0.01953125}]
    # While this looks like a dictionary, it is actually just a  string. json loads
    # makes it a dictionary we can operate on.
    disks = json.loads(request.args.get('disks'))

    form = InventoryForm()
    return render_template("ceph_disk_list.html", form=form, device_count=int(device_count), disks=disks)

@app.route('/_gather_sensor_facts')
def _gather_sensor_facts():
    pass

@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/kit_configuration', methods=['GET', 'POST'])
def kit_configuration():
    form = InventoryForm()
    return render_template('kit_inventory.html', title='Configure Inventory', form=form)

@app.route('/help')
def help():
    form = HelpPage()
    print form.server_is_master_server_checkbox.description
    return render_template("help.html", form=form)
