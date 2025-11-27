from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
from setup.login_manager import  *
from src.services.AuctionService import *
from src.services.ImageService import *
from src.services.ProductService import *
from datetime import datetime
bp = Blueprint('admin_pages', __name__)

@bp.route("/admin", methods=["GET"])
@authenticated_only
def admin_page():
    return render_template("admin/admin_page.html")