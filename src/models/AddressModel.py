from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import relationship # Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 
from sqlalchemy import Table


class AddressModel(db.Model):
    __table__ = Table("address",DB_METADATA,autoload_with=db.engine)

    users = db.relationship("UserModel", back_populates="address", cascade="all, delete")
    cities = db.relationship("CityModel", back_populates="cities")