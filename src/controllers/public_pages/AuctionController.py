from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
from setup.login_manager import  *
from src.services.AuctionService import *
from datetime import datetime
bp = Blueprint('auction_public_pages', __name__)


@bp.route('/auctions', methods=['GET'])

def get_auctions_main_page(): # fix here
    auction_list,total_pages = get_auctions_info()
    print(auction_list)
    return render_template("public/auction/auctions_main_page.html",auctions_list = auction_list,total_pages = total_pages)

@bp.route("/auction/<int:auction_id>")
def auction_page(auction_id):
    data = get_full_auction_data(auction_id)

    if not data:
        return "Leilão não encontrado", 404
    print("AUCTION_DATA")
    print(data["auction_data"])
    print("LOT_DATA")
    print(data["lot_data"])
    print("PRODUCTS_DATA")
    print(data["products_data"])
    print("BIDS_DATA")
    print(data["bids_data"])
    print("AUCTION_ID")
    print(data["auction_id"])
    print("USER_BALANCE_DATA")
    print(data["user_balance_data"])
 
    return render_template(
        "public/auction/auction_info.html",
        auction_data=data["auction_data"],
        lot_data=data["lot_data"],
        product_data=data["products_data"],
        bids_data=data["bids_data"],
        auction_id = data["auction_id"],
        user_balance = data["user_balance_data"]
    )
"""
@bp.route("/auctions", methods=["GET"])
def list_auctions_page():
    auctions = AuctionModel.query.all()
    # enviamos para o front a lista JSON:
    auctions_json = [{
        "idAuction": a.idAuction,
        "title": a.title,
        "descriptionAuction": a.descriptionAuction,
        "startDate": a.startDate.isoformat() if a.startDate else None,
        "endDate": a.endDate.isoformat() if a.endDate else None,
        "statusAuction": a.statusAuction,
        "fkUserIdUser": a.fkUserIdUser
    } for a in auctions]
    return render_template("auction/list.html", auctions=auctions_json)
"""
