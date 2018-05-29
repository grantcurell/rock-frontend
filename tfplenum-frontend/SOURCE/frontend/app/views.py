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

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    form = InventoryForm()
    return render_template('index.html', title='Configure Inventory', form=form)

@app.route('/about')
def about():
    return render_template("about.html")
