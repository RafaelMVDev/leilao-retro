from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
bp = Blueprint('auction_public_pages', __name__)


@bp.route('/auctions', methods=['GET'])

def get_auctions_main_page():
    return render_template("public/auction/auctions_main_page.html")