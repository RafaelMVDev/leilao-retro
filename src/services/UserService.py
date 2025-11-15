from src.models.UserModel import UserModel

from src.services.AdressService import *

from setup.loaders.database import DB_SESSION
from sqlalchemy import select
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
from datetime import datetime

from setup.loaders.database import db  
#add verification of the input fields with flask wtf
_user_obrigatory_fields =  [   # reference table to verify if there is any missing fields that are obrigatory
        "nickname",
        "firstName",
        "lastName",
        "email",
        "password",
        "phone",
        "birthDate",
        
]

_addr_obrigatory_fields = [

    "zipCode",
    "state",
    "country",
    "street",
    "city",
    "district",
    "number",
    
]

def get_user_data(email,password, id = False):
    with DB_SESSION() as Session:
        stm = select(UserModel).filter_by(email = email,password = password)
        result = Session.execute(stm).scalars().first()
        return result
    
def get_id_with_email(email:str) -> int | bool:
    with DB_SESSION() as Session:
        stm = select(UserModel).filter_by(email = email)
        result = Session.execute(stm).scalars().first()
        if result.id:
            return result
        return False

""" Function that validates the fields sent from the front-end
Returns a tuple (bool,<response>)
bool: if the validation was a sucess,
response: jsonify() with the response message
"""

def missing_fields(user_data,addr_data):
    #Check if the obrigatory fields are filled!
    with DB_SESSION() as Session:
        for field in _user_obrigatory_fields:
            if not user_data.get(field):
                print(f"Campo obrigatorio faltante em user: {field}")
                return (True,jsonify({"error": f"Campo obrigatorio faltante em user: {field}"})) # retuyrn a tup
        for field in _addr_obrigatory_fields:
            if not addr_data.get(field):
                print(f"Campo obrigatorio faltante em addr: {field}")
                return (True,jsonify({"error": f"Campo obrigatorio faltante em addr: {field}"}))
 

""" This function inserts the user table and related tables that need to be initiated ( like wallet and adress)"""
def register_user(user_data: dict,addr_data:dict) -> int | dict:
    print("Rodando register user!")
    print(user_data)
    print(addr_data)
    """
    user_data 
    {
        "nickname": str,
        "firstName": str,
        "lastName": "str,
        "email": "str,
        "password": "str,
        "profilePhoto": "str",
        "phone": "str",
        "birthDate": "str",
        
    }
    addr_data
    {
        "zipCode":str,
        "district": str,
        "street": str,
        "number": str,
        "state": str,
        "city":str,
        "country": str
        "complement":str,

    }
    """ 
    # ==== VALIDATION OF THE DATA ====
    # verifies if there is already an ocurrency in the db ( may change to unique raise error on the db later)
    
    email_exists = db.session.query(UserModel).filter_by(email=user_data.get("email")).first() # maybe turn into function later
    if email_exists:
        return jsonify({"error": "E-mail já cadastrado."}), 400
    
    field_missing = missing_fields(user_data=user_data,addr_data=addr_data) # move to address service later? 
    if field_missing:
        print("MISSING FIELD!")
        return field_missing[1]
    
    #add hash here (CHANGE LATER)
    hashed_password = generate_password_hash(user_data.get("password"))
    
    is_valid, data = register_adress(addr_data_unv = addr_data)
    if not is_valid: # if it's not valid,data represents a json with the error
        print(f"Is valid? {is_valid}: {data}")
        return data # the
    #add verification in the fields later
    new_user = UserModel(
        nickname=user_data.get("nickname"),
        firstName=user_data.get("firstName"),
        lastName=user_data.get("lastName"),
        email=user_data.get("email"),
        password=hashed_password,
        profilePhoto=user_data.get("profilePhoto"),
        phone=user_data.get("phone"),
        birthDate=user_data.get("birthDate"),
        registrationDate=datetime.utcnow(),
        address = data #relationship magic!! finally 
    )

    # 4️⃣ Salva no banco
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuário registrado com sucesso!"}), 201
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": f"Erro when registering user (duplicate?). {e}" }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500 
