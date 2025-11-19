from flask_socketio import join_room, leave_room, emit
from setup.init_socket import socketio
from src.services import AuctionService as auction
from src.services import ProductService as product


@socketio.on("join_auction")
def join_auction_event(data):
    auction_id = data.get("auction_id")
    user_id = data.get("user_id")

    valid, result = auction.validate_auction(auction_id)
    if not valid:
        emit("error", {"message": result})
        return

    room = f"auction_{auction_id}"
    join_room(room)

    emit("joined", {"auction_id": auction_id, "user_id": user_id})
    emit("participants_update", room=room, broadcast=True)


@socketio.on("leave_auction")
def leave_auction_event(data):
    auction_id = data.get("auction_id")
    user_id = data.get("user_id")

    room = f"auction_{auction_id}"
    leave_room(room)

    emit("left", {"auction_id": auction_id, "user_id": user_id})
    emit("participants_update", room=room, broadcast=True)


@socketio.on("new_bid")
def new_bid_event(data):
    auction_id = data.get("auction_id")
    user_id = data.get("user_id")
    amount = data.get("amount")

    success, result = auction.update_bid(auction_id, user_id, amount)
    if not success:
        emit("error", {"message": result})
        return

    updated = result
    room = f"auction_{auction_id}"

    # envia atualização para todos na sala
    emit("new_bid", {
        "auction_id": auction_id,
        "current_bid": updated.current_bid,
        "last_bid_user": updated.last_bid_user
    }, room=room)

    # envia para usuários que já deram lance (mesmo fora da sala)
    notified = auction.get_notified_users(auction_id)

    for uid in notified:
        emit("new_bid", {
            "auction_id": auction_id,
            "current_bid": updated.current_bid
        }, to=str(uid))


def emit_time_update(auction_id, minutes_left):
    valid, _ = auction.validate_auction(auction_id)
    if not valid:
        return

    room = f"auction_{auction_id}"
    socketio.emit("time_update", {
        "auction_id": auction_id,
        "minutes_left": minutes_left
    }, room=room)