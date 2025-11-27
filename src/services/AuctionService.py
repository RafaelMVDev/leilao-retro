# src/services/auction_service.py
from setup.loaders.database import db
from src.models.AuctionModel import AuctionModel
from src.models.LotModel import LotModel
from src.models.ProductModel import ProductModel
from src.models.BidModel import BidModel
from src.models.ProductImageModel import ProductImageModel
from src.models.ImageModel import ImageModel
from setup.loaders.database import DB_SESSION
from datetime import datetime,timedelta,timezone
from setup.scheduler import scheduler
from sqlalchemy import select
from sqlalchemy import func

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

            if utc_end <= utc_start:
                raise ValueError("A data final deve ser maior que a data inicial")

            allowed_diff = timedelta(minutes=5)

            if utc_start < now and (now - utc_start) > allowed_diff:
                raise ValueError("Start date muito antiga. Máximo permitido: 10 minutos atrás")

            if utc_end <= now:
                raise ValueError("End date não pode estar no passado")

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

def ensure_utc(dt):
   
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def get_auctions_info(page=1, per_page=10):
    with DB_SESSION() as Session:
        offset = (page - 1) * per_page
        auctions_query = Session.query(AuctionModel).order_by(AuctionModel.startDate.desc()).offset(offset).limit(per_page)
        auctions_list = []

        now = datetime.now(timezone.utc)

        for auction in auctions_query:
            status = auction.status

            start = ensure_utc(auction.startDate)
            end = ensure_utc(auction.endDate)

            print(f"StartDate: {start}")
            print(f"End Date: {end}")
            print(f"Now: {now}")

            if status == 'Open':
                remaining = end - now if end else None
            elif status == 'Scheduled':
                remaining = start - now if start else None
            else:
                remaining = None

            # Se remaining existir, usa total_seconds pra decidir se expirou
            if remaining is None:
                remaining_str = ""
            else:
                secs = remaining.total_seconds()
                if secs <= 0:
                    # já expirou (<= 0)
                    remaining_str = "00:00:00"
                  
                    auction.status = 'Finished'
                    Session.add(auction)  # se estiver usando SQLAlchemy
                    Session.commit()
                else:
                    # Formata dias/hours/mins/seconds corretamente a partir de total_seconds
                    secs_int = int(secs)
                    days, rem = divmod(secs_int, 86400)
                    hours, rem = divmod(rem, 3600)
                    minutes, seconds = divmod(rem, 60)
                    if days > 0:
                        remaining_str = f"{days}d {hours}h {minutes}m"
                    else:
                        remaining_str = f"{hours:02}:{minutes:02}:{seconds:02}"

            print(f"Remaining: {remaining} -> {remaining_str}")

            auctions_list.append({
                "id": auction.idAuction,
                "title": auction.title,
                "owner": auction.users.nickname,  # Ajuste conforme relacionamento
                #"category": auction.category.name if auction.category else "",
                #"location": auction.location or "",
                #"tag": auction.tag or "",
                "status": status,
                "status_display": status.upper(),
                "current_bid": f"R$ {auction.lots[0].currentBidValue:.2f}" if auction.lots[0].currentBidValue else f"R$ {auction.minimumBid:.2f}",
                "bids_count": count_bids_by_auction(auction.idAuction),
                "end_date": auction.endDate,
                "remaining_time": remaining_str,
                "winner": auction.lots[0].currentWinnerId if auction.lots[0].currentWinnerId else "",
                "cover_image": get_auction_cover_image(auction.idAuction)
            })

        # Obtem total de páginas
        total_auctions = Session.query(AuctionModel).count()
        total_pages = (total_auctions + per_page - 1) // per_page

        return (auctions_list, total_pages)

def get_auction_cover_image(auction_id):
    with DB_SESSION() as session:

        image = (
             session.query(ImageModel.fileName)
            .join(ProductImageModel, ProductImageModel.fkImageIdImage == ImageModel.idImage)
            .join(ProductModel, ProductImageModel.fkProductIdProduct == ProductModel.idProduct)
            .join(LotModel, ProductModel.fkLotIdLot == LotModel.idLot)
            .join(AuctionModel, LotModel.fkAuctionIdAuction == AuctionModel.idAuction)
            .filter(AuctionModel.idAuction == auction_id)
            .order_by(ProductImageModel.displayOrder.asc())
            .first()
        )

        if image:
            return image[0]  # pois estamos buscando só o fileName

        return None



def count_bids_by_auction(auction_id):
    with DB_SESSION() as session:
        total = (
            session.query(func.count(BidModel.idBid))
            .join(LotModel, BidModel.fkLotIdLot == LotModel.idLot)
            .filter(LotModel.fkAuctionIdAuction == auction_id)
            .scalar()
        )

        return total or 0
    
def close_auction_job(auction_id):
    from app import app
    print(f"CLOSING AUCTION {auction_id} with job ")
    with app.app_context():
        with DB_SESSION() as Session:
            stm = select(AuctionModel).where(idAuction = auction_id)
            auction = db.session.execute(stm).mappings().first()

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
            stm = select(AuctionModel).where(idAuction = auction_id)
            auction = db.session.execute(stm).mappings().first()
            if auction:
                print("Found auction, settings status:")
                auction.status = "Open"
                Session.commit()


def get_full_auction_data(auction_id):
    with DB_SESSION() as session:

        auction = session.query(AuctionModel).filter(
            AuctionModel.idAuction == auction_id
        ).first()

        if not auction:
            return None

        auction_data = build_auction_data(auction)
        lot_data = build_lot_data(auction.lots[0]) if auction.lots else None
        products_data = build_products_data(auction.lots[0].products) if auction.lots else []
        bids_data = build_bids_data(auction.lots[0].bids) if auction.lots else []
        auction_id = auction.idAuction
        user_balance_data = 500
        return {
            "auction_data": auction_data,
            "lot_data": lot_data,
            "products_data": products_data,
            "bids_data": bids_data,
            "auction_id": auction_id,
            "user_balance_data":user_balance_data
        }
def build_bids_data(bids):
    bids_list = []

    for bid in bids:
        bids_list.append({
            "id": bid.idBid,
            "user": bid.users.nickname if bid.users else "Usuário removido",
            "value": float(bid.bidValue),
            "datetime": bid.createdAt.isoformat() if bid.createdAt else None
        })

    return bids_list
def build_auction_data(auction):
    return {
        "id": auction.idAuction,
        "title": auction.title,
        "description": auction.description,
        "status": auction.status,
        "owner": auction.users.nickname,
        "start_date": ensure_utc(auction.startDate).isoformat(),
        "end_date": ensure_utc(auction.endDate).isoformat(),
        "cover_image": get_auction_cover_image(auction.idAuction),
        "created_at": ensure_utc(auction.startDate).strftime("%Y-%m-%d %H:%M:%S"),
    }


def build_lot_data(lot):
    return {
        "id": lot.idLot,
        "lot_number": lot.lotNumber,
        "minimum_bid": float(lot.minimumBid),
        "minimum_increment": float(lot.minimumIncrement),
        "current_bid": float(lot.currentBidValue),
        "current_winner": lot.currentWinnerId,
        "registration_date": lot.registrationDate.isoformat()
    }


def build_products_data(products):
    products_list = []

    for product in products:
        images = [img.images.fileName for img in product.product_images] if hasattr(product, "product_images") else []

        products_list.append({
            "id": product.idProduct,
            "name": product.productName,
            "description": product.descriptionProduct,
            #"base_price": float(product.basePrice),
            "images": images
        })
    print(products_list)
    return products_list







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