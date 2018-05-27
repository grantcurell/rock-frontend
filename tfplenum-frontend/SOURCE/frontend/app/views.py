# views.py

from flask import render_template, flash, redirect, url_for, request, jsonify
from app import app
from app.forms import InventoryForm

@app.route('/_add_numbers')
def add_numbers():
    a = request.args.get('a', 0, type=int)
    b = request.args.get('b', 0, type=int)
    return jsonify(result=a + b)

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    form = InventoryForm()
    return render_template('index.html', title='Configure Inventory', form=form)

@app.route('/about')
def about():
    return render_template("about.html")
