# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from app.forms import InventoryForm

@app.route('/_server')
def _server():
    # This request wil be received from jquery on the client side
    server_count = request.args.get('server_count', 0, type=int)
    form = InventoryForm()
    return render_template("server.html", form=form, server_count=server_count)

@app.route('/_gather_host_facts')
def _gather_host_facts():
    pass


@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
@app.route('/kit_inventory', methods=['GET', 'POST'])
def index():
    form = InventoryForm()
    return render_template('kit_inventory.html', title='Configure Inventory', form=form)

@app.route('/about')
def about():
    return render_template("about.html")