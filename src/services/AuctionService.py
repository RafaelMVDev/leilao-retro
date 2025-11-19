from models import db, AuctionModel, BidModel

def get_auction(auction_id: int):
    return AuctionModel.query.get(auction_id)

def validate_auction(auction_id: int):
    auction = get_auction(auction_id)

    if not auction:
        return False, "O leilão não existe."

    if not auction.active:
        return False, "O leilão está encerrado."

    return True, auction


def update_bid(auction_id: int, user_id: int, amount: float):
    valid, auction = validate_auction(auction_id)
    if not valid:
        return False, auction

    if amount <= auction.current_bid:
        return False, "O lance deve ser maior que o lance atual."

    # Cria novo lance
    new_bid = BidModel(
        auction_id=auction_id,
        user_id=user_id,
        amount=amount
    )
    db.session.add(new_bid)

    # Atualiza o leilão
    auction.current_bid = amount
    auction.last_bid_user = user_id

    db.session.commit()

    return True, auction


def get_notified_users(auction_id: int):
    """
    Todos que já deram lance no leilão recebem atualizações,
    mesmo fora da sala.
    """
    users = (
        db.session.query(BidModel.user_id)
        .filter(BidModel.auction_id == auction_id)
        .distinct()
        .all()
    )

    return [u[0] for u in users]