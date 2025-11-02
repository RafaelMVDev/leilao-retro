from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import relationship,Mapped, mapped_column # Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 
from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy import Table,Column,select


class CurrencyModel(db.Model):
    
    __table__ = Table("currency",DB_METADATA,autoload_with=db.engine)
   