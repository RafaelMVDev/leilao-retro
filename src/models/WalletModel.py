from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import Mapped, mapped_column,relationship # Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 
from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy import Table,Column,select


class WalletModel(db.Model):
    __table__ = Table("wallet",DB_METADATA,autoload_with=db.engine)
    users = db.relationship("UserModel",back_populates = "wallets",foreign_keys=[__table__.c.fkUserIdUser]) #explicit fk because of reflection errors
   