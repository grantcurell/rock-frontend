# views.py

from flask import render_template, flash, redirect
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
def login():
    form = InventoryForm()
    if form.validate_on_submit():
        flash('Login requested for user {}, remember_me={}'.format(
            form.username.data, form.remember_me.data))
        return redirect('/index')
    return render_template('inventory.html', title='Sign In', form=form)
