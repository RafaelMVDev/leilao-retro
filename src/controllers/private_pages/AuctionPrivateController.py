from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
from setup.login_manager import  *
from src.services.AuctionService import *
from datetime import datetime
bp = Blueprint('auction_private_pages', __name__)

@bp.route("/auctions/create", methods=["GET"])
@authenticated_only
def create_auction_form():
    # render template que extende base.html
    return render_template("private/auction/create_auction.html")

@bp.route("/auctions/create", methods=["POST"])
@authenticated_only
def create_auction():
    data = request.get_json()
    start = datetime.fromisoformat(data.get("start_date")) if data.get("start_date") else None
    end = datetime.fromisoformat(data.get("end_date")) if data.get("end_date") else None
    auction, lot = create_auction_with_lot(
        data.get("title"),
        data.get("description"),
        start,
        end,
        current_user.idUser,
        initial_price=float(data.get("initial_price", 0))
    )
    return jsonify({"success": True, "auction_id": auction.idAuction})