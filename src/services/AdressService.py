from src.models.AddressModel import AddressModel
from src.models.CityModel import CityModel
from src.models.CountryModel import CountryModel
from src.models.StateModel import StateModel

from setup.loaders.database import DB_SESSION

from sqlalchemy import select
def register_adress(addr_data):
    with DB_SESSION() as Session:
        country_stm = select(CountryModel).where(CountryModel.nameCountry == addr_data.get("nameCountry"))
        country = Session.scalar(country_stm)
        if not country:
            return (False,"ERROR! COUNTRY DOESN'T EXIST")