# views.py

from flask import render_template, flash, redirect, url_for
from app import app
from app.forms import InventoryForm

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

@app.route('/about')
def about():
    return render_template("about.html")

@app.route('/inventory', methods=['GET', 'POST'])
def inventory():
    form = InventoryForm()
    if form.validate_on_submit():
        flash('Request for inventory file submitted.')
        return redirect(url_for('index'))
    return render_template('inventory.html', title='Configure Inventory', form=form)
