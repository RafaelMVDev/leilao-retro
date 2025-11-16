from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
bp = Blueprint('profile_pages', __name__)

@bp.route('/profile_settings', methods=['GET'])
@authenticated_only # check
def get_profile_page():

    return render_template('private/profile/profile.html')


@bp.route('/submit_logout', methods=['GET'])
def submit_logout():
    pass #CONTINUE FROM HERE