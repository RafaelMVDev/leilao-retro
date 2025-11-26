# src/services/auction_service.py
from setup.loaders.database import db
from src.models.AuctionModel import AuctionModel
from src.models.LotModel import LotModel
from src.models.ProductModel import ProductModel
from src.models.BidModel import BidModel
from setup.loaders.database import DB_SESSION
from datetime import datetime,timedelta,timezone
from setup.scheduler import scheduler
import pytz
local_tz = pytz.timezone("America/Sao_Paulo")

def convert_local_to_utc(date_str):
    """
    Converte uma data local vinda do front para UTC.
    """
    local_dt = datetime.fromisoformat(date_str)
    
   
    if local_dt.tzinfo is None:
        local_dt = local_tz.localize(local_dt)

    utc_dt = local_dt.astimezone(pytz.utc)

 
    return utc_dt

def create_auction_with_lot(auction_data,start_date:datetime,end_date:datetime, lot_data,owner_id):
    try:
        with DB_SESSION() as Session:
            print(type(start_date))
            now = datetime.now(timezone.utc)
            utc_start = convert_local_to_utc(start_date.isoformat())
            utc_end= convert_local_to_utc(end_date.isoformat())
            print("UTC: ",now)
            print("UTC_START: ",utc_start)
            print("UTC_END: ",utc_end)
            start_diff = abs(now - utc_start)
            end_diff = abs(now - utc_end)
    
            if not utc_start or not utc_end:
                raise ValueError("start_date e end_date são obrigatórios")

            # End não pode ser antes do start
            if utc_end <= utc_start:
                raise ValueError("A data final deve ser maior que a data inicial")

            # Start no passado: tolerância de 10 minutos
            allowed_diff = timedelta(minutes=5)

            if utc_start < now and (now - utc_start) > allowed_diff:
                raise ValueError("Start date muito antiga. Máximo permitido: 10 minutos atrás")

            # End date nunca pode estar no passado
            if utc_end <= now:
                raise ValueError("End date não pode estar no passado")

            # Leilão máximo de 5 dias
            max_duration = timedelta(days=5)
            if (utc_end - utc_start) > max_duration:
                raise ValueError("O leilão não pode durar mais que 5 dias")
            
            auction = AuctionModel(
                title=auction_data.get("title"),
                description=auction_data.get("description"),
                startDate=utc_start,
                endDate=utc_end,
                status="Open" if utc_start and utc_start<= now else "Scheduled",
                fkUserIdUser=owner_id
            )
            db.session.add(auction)
            db.session.flush()  

            # creating initial lot
            lot = LotModel(
                minimumIncrement= lot_data.get("minimum_increment") or 0,
                minimumBid=lot_data.get("minimum_bid"),
                registrationDate = now,
                lotNumber=lot_data.get("lot_number"),
                currentBidValue=lot_data.get("minimum_bid"),
                fkAuctionIdAuction=auction.idAuction
            )
            db.session.add(lot)
            db.session.commit()

            #Creating job scheduler
            job_id = f"close_auction_{auction.idAuction}"

            if utc_start > now:
                open_job_id = f"open_auction_{auction.idAuction}"

                if scheduler.get_job(open_job_id):
                    scheduler.remove_job(open_job_id)

                scheduler.add_job(
                    id=open_job_id,
                    func=open_auction_job,
                    trigger="date",
                    run_date=utc_start,
                    args=[auction.idAuction],
                    replace_existing=True
                )

            if scheduler.get_job(job_id):
                scheduler.remove_job(job_id)

            scheduler.add_job(
                id=job_id,
                func=close_auction_job,
                trigger="date",
                run_date=utc_end,
                args=[auction.idAuction],
                replace_existing=True
            )
            

    except Exception as e:
        print("Erro ao criar leilão:", e)
        db.session.rollback()
        return None, None

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

 
    lot.currentBidValue = bid_value

    lot.currentWinner = str(user_id)
    db.session.commit()
    return bid


def close_auction_job(auction_id):
    from app import app
    print(f"CLOSING AUCTION {auction_id} with job ")
    with app.app_context():
        with DB_SESSION() as Session:
            auction = AuctionModel.query.get(auction_id)

            if not auction:
                print("Leilão não encontrado")
                return

            auction.status = "Finished"
            Session.commit()

        print(f"Leilão {auction_id} encerrado com sucesso.")


def open_auction_job(auction_id):
    print(f"OPENING AUCTION {auction_id} with job ")
    from app import app
    with app.app_context():
        with DB_SESSION() as Session:
            auction = AuctionModel.query.get(auction_id)
            if auction:
                auction.status = "Open"
                Session.commit()


def main_page_auctions():
    













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