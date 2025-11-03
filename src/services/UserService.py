from src.models.UserModel import UserModel
from setup.loaders.database import DB_SESSION
from sqlalchemy import select


def get_user_data(email,password):
    with DB_SESSION() as Session:
        stm = select(UserModel).filter_by(email = email)
        result = Session.execute(stm).scalars().first()
        return result
 