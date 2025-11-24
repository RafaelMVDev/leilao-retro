from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services import UserService
from flask_wtf.csrf import CSRFProtect
from setup.login_manager import  *
from src.services.AuctionService import *
from datetime import datetime
bp = Blueprint('auction_public_pages', __name__)


@bp.route('/auctions', methods=['GET'])

def get_auctions_main_page():
    return render_template("public/auction/auctions_main_page.html")
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
