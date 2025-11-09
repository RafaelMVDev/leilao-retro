from src.models.AddressModel import AddressModel
from src.models.CityModel import CityModel
from src.models.CountryModel import CountryModel
from src.models.StateModel import StateModel

from setup.loaders.database import DB_SESSION

from sqlalchemy import select

""" register adress assuming that the data sent was verified ( if the adress exists and all required fields are filled)"""
def register_adress(addr_data):
    with DB_SESSION() as Session:
        country_stm = select(CountryModel).where(CountryModel.nameCountry == addr_data.get("nameCountry"))
        country = Session.scalar(country_stm)
        if not country:
            return (False,"ERROR! COUNTRY DOESN'T EXIST")
        state_stm = select(StateModel).where(StateModel.stateName == addr_data.get("stateName"),StateModel.fkCountryIdCountry == country.idCountry)
        state = Session.scalar(state_stm)
        if not state:
            # register state
            pass
        city_stm = select(CityModel).where(CityModel.nameCity == addr_data.get("nameCity"),CityModel.fkStateIdState == state.idState)
        city = Session.scalar(city_stm)
        if not city:
            #register city
            pass
        new_adress = AddressModel(
            zipCode = addr_data.get("zipCode"),
            district= addr_data.get("district"),
            street = addr_data.get("street"),
            numberAddress = addr_data.get("numberAddress"),
            complement = addr_data.get("complement") if addr_data.get("complement") else None,
            cities = city 
        )
        return new_adress