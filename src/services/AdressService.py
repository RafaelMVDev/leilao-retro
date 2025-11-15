from src.models.AddressModel import AddressModel
from src.models.CityModel import CityModel
from src.models.CountryModel import CountryModel
from src.models.StateModel import StateModel
import country_converter as coco
from setup.loaders.database import DB_SESSION
import requests
import json
from sqlalchemy import select
import re
from flask import jsonify,json
import json

# ==== API ENDPOINT FOR VALIDATING ADDRESS BELOW ====
validate_address_endpoint = "https://addressvalidation.googleapis.com/v1:validateAddress" # api that is gonna be called to check if address exists 

cc = coco.CountryConverter()
def get_region_code(country):
    """
    I need to sleep. This one get's the cldr code because we'll need it when fetching the address from google's API
    """
    print("GETTING REGION CODE...")
    print(type(country))
    print(len(country))
    print(country)
    code = cc.convert(names = "Brazil", to = "ISO2")

    return code if code else None

def address_exists(addr_data):
    regionCode = get_region_code(addr_data.get("country"))
    print(regionCode)
    if not regionCode:
        print("UNABLE TO GET REGION CODE")
        return jsonify({"error": "Unable to get region code"})
    post_data = {
        "address" : {
            "regionCode": regionCode,
            "postalCode": addr_data.get("zipCode"),
            "locality": addr_data.get("city"),
            "administrativeArea": addr_data.get("state"),
            "addressLines": [f'{addr_data.get("street")}, {addr_data.get("district")}']
        }
    }

    try:        
        response = requests.post(validate_address_endpoint,
                              params = "",
                              json =jsonify(post_data))
        response.raise_for_status()
        print("RESPONSE FROM GOOGLE API: ",response.text)
        return json(response) # 12/11 continue from here
    
    except requests.RequestException as error:
        print(f"ERROR WHEN FETCHING ADDRESS DATA FROM GOOGLE API: {error}")
def clean_whitespaces(text: str) -> str:
    """
    Remove tab or additional spaces!
    """
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
# checks if address exists based on api


def remove_addr_whitespaces(addr_data):
    return {key: clean_whitespaces(value) if isinstance(value, str) else value
        for key, value in addr_data.items()}

""" register adress assuming that the data sent was verified ( if the adress exists and all required fields are filled)"""
def register_adress(addr_data_unv : dict) ->tuple[bool,AddressModel]: #unc here stands for unverified (data is gonna be verified below)
    """Validates address data and creates an entry in City,State and Address tables if they don't exist already stabilishing relationship between them"""
    with DB_SESSION() as Session:
        addr_data = remove_addr_whitespaces(addr_data_unv)
        addr_exists = address_exists(addr_data)
        if addr_exists: # if is invalid we just return an error
            return (False,"ERROR: Address doesn't exist")
        
        # Check if there are occurances of country, state and city in their respective tables ( prevent duplicate data)
        country_stm = select(CountryModel).where(CountryModel.nameCountry == addr_data.get("nameCountry"))
        country = Session.scalar(country_stm)
        if not country:
            return (False,"ERROR! COUNTRY DOESN'T EXIST")
        state_stm = select(StateModel).where(StateModel.stateName == addr_data.get("stateName"),StateModel.fkCountryIdCountry == country.idCountry)
        state = Session.scalar(state_stm)
        if not state:
            # register state
            state = StateModel(
                stateName = addr_data.get("state"),
                countries = country
            )
           
        city_stm = select(CityModel).where(CityModel.nameCity == addr_data.get("nameCity"),CityModel.fkStateIdState == state.idState)
        city = Session.scalar(city_stm)
        if not city:
            #register city
            city = CityModel(
                nameCity = addr_data.get("city"),
                states = state
            )
           
        new_adress = AddressModel(
            zipCode = addr_data.get("zipCode"),
            district= addr_data.get("district"),
            street = addr_data.get("street"),
            numberAddress = addr_data.get("numberAddress"),
            complement = addr_data.get("complement") if addr_data.get("complement") else None,
            cities = city 
        )
        # Adding all ocurrances to session and commiting ( add rollbacklater! -nvm it's automatic)
        Session.add_all([country,state,city,new_adress])
        Session.commit()
        return (True,new_adress)