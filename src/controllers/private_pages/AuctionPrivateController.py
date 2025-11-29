from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
from setup.login_manager import  *
from src.services.AuctionService import *
from src.services.ImageService import *
from src.services.ProductService import *
from datetime import datetime
bp = Blueprint('auction_private_pages', __name__)

@bp.route("/auctions/create", methods=["GET"])
@authenticated_only
def create_auction_form():
    return render_template("private/auction/create_auction.html")

from flask import request, jsonify
from datetime import datetime
import json

@bp.route("/auctions/create", methods=["POST"])
@authenticated_only
def create_auction():

    # ================= AUCTION DATA =================
    auction_raw = request.form.get("auctionData")
    lot_raw = request.form.get("lotData")

    if not auction_raw or not lot_raw:
        return jsonify({"success": False, "message": "Dados do leilão ou lote ausentes"}), 400

    auction_data = json.loads(auction_raw)
    lot_data = json.loads(lot_raw)

    start = datetime.fromisoformat(auction_data.get("start_date")) if auction_data.get("start_date") else None
    end = datetime.fromisoformat(auction_data.get("end_date")) if auction_data.get("end_date") else None


    auction, lot = create_auction_with_lot(
        auction_data=auction_data,
        start_date = start,
        end_date = end,
        lot_data=lot_data,
        owner_id= current_user.idUser
    )

    products = []

    for key in request.form:
        if key.startswith("products["):
            try:
                product_data = json.loads(request.form.get(key))
                products.append(product_data)
            except:
                pass

    created_products = []

    for index, product in enumerate(products):
        images_key = f"product_images_{index}"
        if images_key in request.files:
            images = request.files.getlist(images_key)
        created_product = create_product(
            product,
            lot_id=lot.idLot,
            image_files = images
        )

        created_products.append(created_product)

       

    return jsonify({
        "success": True,
        "auction_id": auction.idAuction,
        "products_created": len(created_products)
    })


@bp.route("/auctions/<auction_id>/make_bid", methods=["POST"])
@authenticated_only
def make_bid(auction_id):
    data = request.get_json()

    result = process_bid(auction_id=auction_id,bid_value=data.get("bid_value"),user_id=current_user.idUser)
    return result