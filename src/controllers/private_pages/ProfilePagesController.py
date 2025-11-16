from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
bp = Blueprint('profile_pages', __name__)

@bp.route('/profile_settings', methods=['GET'])
@authenticated_only # check
def get_profile_page():

    return render_template('private/profile/profile.html')


@bp.route('/submit_logout', methods=['POST'])
@authenticated_only
def submit_logout():
    print("Logging off")
    UserService.logout()
    return redirect(url_for("auth_pages.login_page"))


