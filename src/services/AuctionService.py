from src.models.ProductModel import ProductModel
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
        }