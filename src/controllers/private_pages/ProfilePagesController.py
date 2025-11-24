from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
bp = Blueprint('profile_pages', __name__)

temporary_wallet_data = {
    "wallet_external": {"currentBalance": 0},
    "wallet_internal": {"currentBalance": 0}
}
@bp.route('/profile_settings', methods=['GET'])
@authenticated_only # check
def get_profile_page():
    user_data = session.get("user_data")
    profile_settings = user_data.get("profile_settings")
    address_data = user_data.get("address_data")
    wallets_data = user_data.get("wallets_data")
    print("testss")
    print(wallets_data if wallets_data else temporary_wallet_data)
    return render_template('private/profile/profile.html',
                           profile_settings = profile_settings,
                           address_data = address_data,
                           wallets_data = wallets_data if wallets_data else temporary_wallet_data )


@bp.route('/submit_logout', methods=['POST'])
@authenticated_only
def submit_logout():
    print("Logging off")
    UserService.logout()
    return redirect(url_for("auth_pages.login_page"))


