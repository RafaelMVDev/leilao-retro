# src/services/auction_service.py
from setup.loaders.database import db
from src.models.AuctionModel import AuctionModel
from src.models.LotModel import LotModel
from src.models.ProductModel import ProductModel
from src.models.BidModel import BidModel
from datetime import datetime

def create_auction_with_lot(auction_data,start_date,end_date, lot_data,owner_id):
    auction = AuctionModel(
        title=auction_data.get("title"),
        descriptionAuction=auction_data.get("description"),
        startDate=start_date,
        endDate=end_date,
        statusAuction="ACTIVE" if auction_data.get("start_date") and auction_data.get("start_date") <= datetime.utcnow() else "CREATED",
        fkUserIdUser=owner_id
    )
    db.session.add(auction)
    db.session.flush()  # garante idAuction

    # cria lote inicial
    lot = LotModel(
        minimumIncrement= lot_data.get("minimum_increment") or 0,
        minimumBid=lot_data.get("minimum_bid"),
        registrationDate = 0,
        lotNumber=lot_data.get("lot_number"),
        currentBidValue=lot_data.get("minimum_bid"),
        fkAuctionIdAuction=auction.idAuction
    )
    db.session.add(lot)
    db.session.commit()
    return auction, lot

def add_product_to_lot(lot_id, product_data):
    product = ProductModel(
        productName=product_data.get("name"),
        productDescription=product_data.get("description"),
        basePrice=product_data.get("price", 0),
        imageUrl=product_data.get("imageUrl"),
        fkLotIdLot=lot_id
    )
    db.session.add(product)
    db.session.commit()
    return product

def place_bid(lot_id, user_id, bid_value):
    lot = LotModel.query.get(lot_id)
    if not lot:
        raise ValueError("Lot not found")

    # validação simples: bid maior que currentBidValue + minimumIncrement
    min_valid = (lot.currentBidValue or lot.minimumBid) + (lot.minimumIncrement or 0)
    if bid_value < min_valid:
        raise ValueError(f"Bid must be at least {min_valid}")

    bid = BidModel(
        bidValue=bid_value,
        fkUserIdUser=user_id,
        fkLotIdLot=lot_id
    )
    db.session.add(bid)

    # atualiza lot
    lot.currentBidValue = bid_value
    # atualize currentWinner com nome do user (ou user id)
    # aqui suponho que você queira o nickname: busque user se desejar
    lot.currentWinner = str(user_id)
    db.session.commit()
    return bid






















"""from src.models.ProductModel import ProductModel
from src.models.ImageModel import ImageModel
from sqlalchemy import func
from src.models.BidModel import BidModel
from src.models.AuctionModel import AuctionModel
from datetime import datetime
from setup.loaders.database import DB_SESSION

def create_product(description, manufacturer, product_type,
                   width, height, depth, weight,
                   activation_key=None, download_valid=None, download_url=None):

    with DB_SESSION() as session:
        product = ProductModel(
            descriptionPro=description,
            manufacturer=manufacturer,
            productType=product_type,
            width=width,
            height=height,
            depth=depth,
            weight=weight,
            activationKey=activation_key,
            downloadValid=download_valid,
            downloadUrl=download_url
        )

        session.add(product)
        session.commit()
        session.refresh(product)

        return product


def add_image_to_product(product_id, image_url):

    with DB_SESSION() as session:

        image = ImageModel(
            fkProductIdProduct=product_id,
            imageUrl=image_url
        )

        session.add(image)
        session.commit()
        session.refresh(image)

        return image



def create_auction(user_id, product_id, title, description, start_date, end_date):

    with DB_SESSION() as session:

        auction = AuctionModel(
            title=title,
            descriptionAuc=description,
            startDate=start_date,
            endDate=end_date,
            statusAuction="ACTIVE",
            fkUserIdUser=user_id,
            fkLotIdLot=product_id
        )

        session.add(auction)
        session.commit()
        session.refresh(auction)

        return auction
    

def create_bid(user_id, auction_id, bid_value):

    with DB_SESSION() as session:

        bid = BidModel(
            bidValue=bid_value,
            bidDateTime=datetime.utcnow(),
            fkUserIdUser=user_id,
            fkLotIdLot=auction_id
        )

        session.add(bid)
        session.commit()
        session.refresh(bid)

        return bid
    
def get_auctions_by_user(user_id):

    with DB_SESSION() as session:

        auctions = session.query(AuctionModel) \
            .filter(AuctionModel.fkUserIdUser == user_id) \
            .all()

        return auctions

def get_bids_by_user(user_id):

    with DB_SESSION() as session:

        bids = session.query(BidModel) \
            .filter(BidModel.fkUserIdUser == user_id) \
            .order_by(BidModel.bidDateTime.desc()) \
            .all()

        return bids
    

def get_product_from_auction(auction_id):

    with DB_SESSION() as session:

        auction = session.get(AuctionModel, auction_id)

        if not auction:
            return None

        return auction.product


def get_all_active_auctions():

    with DB_SESSION() as session:

        auctions = session.query(AuctionModel) \
            .filter(AuctionModel.statusAuction == "ACTIVE") \
            .all()

        return auctions
    

def get_bids_from_auction(auction_id):

    with DB_SESSION() as session:

        bids = session.query(BidModel) \
            .filter(BidModel.fkLotIdLot == auction_id) \
            .order_by(BidModel.bidValue.desc()) \
            .all()

        return bids


def get_auctions_open_for_bids():

    from datetime import datetime

    now = datetime.utcnow()

    with DB_SESSION() as session:

        auctions = session.query(AuctionModel) \
            .filter(AuctionModel.startDate <= now) \
            .filter(AuctionModel.endDate >= now) \
            .filter(AuctionModel.statusAuction == "ACTIVE") \
            .all()

        return auctions



def get_highest_bid(auction_id):

    with DB_SESSION() as session:

        highest = session.query(func.max(BidModel.bidValue)) \
            .filter(BidModel.fkLotIdLot == auction_id) \
            .scalar()

        return highest or 0

def get_product_with_images_from_auction(auction_id):

    with DB_SESSION() as session:

        auction = session.query(AuctionModel) \
            .filter(AuctionModel.idAuction == auction_id) \
            .first()

        if not auction:
            return None

        product = auction.product

        return {
            "product": product,
            "images": product.images
        }"""