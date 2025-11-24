from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import Mapped,relationship# Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 

from sqlalchemy import Table
from flask_login import UserMixin

class UserModel(UserMixin,db.Model): #explain user mixin later  ( Flassk LOgin)

    __table__ = Table("user",DB_METADATA,autoload_with=db.engine)
   
    user_addresses = db.relationship("UserAddressModel", back_populates = "users")
    wallets = db.relationship("WalletModel",back_populates = "users")
    def get_id(self):
        return str(self.idUser)