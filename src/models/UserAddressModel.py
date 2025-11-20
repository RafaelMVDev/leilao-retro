from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import Mapped,relationship# Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 
from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy import Table,Column,select


class UserAddressModel(db.Model):

    __table__ = Table("useraddress",DB_METADATA,autoload_with=db.engine)
    addresses = db.relationship("AddressModel", back_populates="user_addresses")
    users = db.relationship("UserModel",back_populates = "user_addresses" )
    wallets = db.relationship("WalletModel", back_populates = "users")