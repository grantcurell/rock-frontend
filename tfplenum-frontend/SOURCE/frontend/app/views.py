# views.py

from flask import render_template, flash, redirect, url_for
from app import app
from app.forms import InventoryForm

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    form = InventoryForm()
    if form.validate_on_submit():
        flash('Request for inventory file submitted.')
    return render_template('index.html', title='Configure Inventory', form=form)

@app.route('/about')
def about():
    return render_template("about.html")
