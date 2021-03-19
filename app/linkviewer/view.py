from flask import Blueprint, request, session, flash, url_for, redirect, render_template

bp = Blueprint('view', __name__, url_prefix='/view')


@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        password = request.form['password']
        if password == "tijsiscool":
            session.clear()
            session['loggedin'] = True
            return redirect(url_for('view.index'))
        else:
            flash("Incorrect password")

    return render_template('login.html')


@bp.route('/', methods=["GET"])
def index():
    if 'loggedin' not in session:
        return redirect(url_for('view.login'))
    return render_template('index.html')


