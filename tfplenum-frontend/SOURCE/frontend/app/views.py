# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from api.node_facts import *
from app.forms import InventoryForm, HelpPage

@app.route('/_server')
def _server():
    # This request wil be received from jquery on the client side
    server_count = request.args.get('server_count', 0, type=int)
    form = InventoryForm()
    return render_template("server.html", form=form, server_count=server_count)

@app.route('/_gather_host_facts')
def _gather_host_facts():
    # This request wil be received from jquery on the client side
    server_management_ip = request.args.get('server_management_ip')
    '''
    n = get_system_info(server_management_ip, 'I.am.ghost.47')
    for i in n.interfaces:
        print("Name: " + i.name)
        print("Ip Address: " + i.ip_address)
        print("Mac: " +i.mac_address)
    '''
    return render_template('host_facts.html')

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
