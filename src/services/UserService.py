from src.models.UserModel import UserModel
from src.models.UserAddressModel import UserAddressModel
from src.models.WalletModel import WalletModel
from src.services.AdressService import *

from setup.loaders.database import DB_SESSION
from setup.login_manager import login_manager
from sqlalchemy import select
from flask import jsonify,redirect,url_for,flash,session
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash,check_password_hash
from datetime import datetime
from flask_login import LoginManager,logout_user,login_user,current_user
from sqlalchemy import select
from src.services.EmailService import generate_token, send_email

from src.models.CityModel import CityModel
from src.models.StateModel import StateModel

from functools import wraps
from setup.loaders.database import db  
#add verification of the input fields with flask wtf
_user_obrigatory_fields =  [   # reference table to verify if there is any missing fields that are obrigatory
        "nickname",
        "firstName",
        "lastName",
        "email",
        "userPassword",
        "phone",
        "birthDate",
        
]

_addr_obrigatory_fields = [

    "zipCode",
    "stateName",
    "nameCountry",
    "street",
    "nameCity",
    "district",
    "numberAddress",
    
]

@login_manager.user_loader
def load_user(user_id):
    return DB_SESSION().get(UserModel, int(user_id))

def authenticate_user(db_session,email, password):
    try:
        user = db_session.execute(
        select(UserModel).where(UserModel.email == email)
        ).scalar_one_or_none()

        check = check_password_hash(user.userPassword, password)
      
        if user and check:
            if user.isAuthenticated:
                print(f"Logging user: {user}")
                login_user(user)
                if session.get("user_data"):
                    session["user_data"]["profile_settings"] = get_user_settings(user.idUser)
                    session["user_data"]["address_data"]  =get_full_address_data(user.idUser)
                    print(session["user_data"]["address_data"] )
                else:
                    session["user_data"] = {}
                return True
            else:
                return "Usuário não autenticado"
    except Exception as e:
        print(e)
        return False

def logout():
    logout_user()



    
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
    with DB_SESSION() as Session:
        email_exists = db.session.query(UserModel).filter_by(email=user_data.get("email")).first() # maybe turn into function later
        if email_exists:
            print("EMAIL JA EXISTE VAGABUNDO")
            return jsonify({"error": "E-mail já cadastrado."}), 400
        
        field_missing = missing_fields(user_data=user_data,addr_data=addr_data) # move to address service later? 
        if field_missing:
            print("MISSING FIELD!")
            return field_missing[1]
        
        #add hash here (CHANGE LATER)
        hashed_password = generate_password_hash(user_data.get("userPassword"))
        
        is_valid, data = register_adress(Session,addr_data_unv = addr_data)
        if not is_valid: # if it's not valid,data represents a json with the error
            print(f"Is valid? {is_valid}: {data}")
            return data # the
        print(f"Address Model: {data}")
        #add verification in the fields later
        new_user = UserModel(
            nickname=user_data.get("nickname"),
            firstName=user_data.get("firstName"),
            lastName=user_data.get("lastName"),
            email=user_data.get("email"),
            userPassword=hashed_password,
            profilePhoto=user_data.get("profilePhoto"),
            phone=user_data.get("phone"),
            birthDate=user_data.get("birthDate"),
            registrationDate=datetime.utcnow(),
            
        )
        wallet_bzz_coins = WalletModel(
            lastUpdate = datetime.utcnow(),
            currentBalance = 2,
            creationDate = datetime.utcnow(),
            users = new_user,
            fkCurrencyIdCurrency = 1
        )

        wallet_country_coins = WalletModel(
            lastUpdate = datetime.utcnow(),
            currentBalance = 500,
            creationDate = datetime.utcnow(),
            users = new_user,
            fkCurrencyIdCurrency = 2
        )


        new_user_address = UserAddressModel(
            addresses = data,
            users = new_user
        )
        # 4️⃣ Salva no banco
        try:
            print("REGISTRANDO!!")
            Session.add(new_user,new_user_address)
            Session.commit()
            token = generate_token(user_data.get("email"))
            confirm_url = f"{url_for("auth_pages.confirm_email")}/{token}"

            html = f"""
            <h3>Confirme sua conta</h3>
            <p>Clique no link abaixo para ativar sua conta:</p>
            <a href="{confirm_url}">{confirm_url}</a>
            """

            send_email(user_data.get("email"), "Confirmação da Conta", html)
            return jsonify({"message": f"Usuário registrado com sucesso! Email de autenticação enviado para: {user_data.get("email")}"}), 201
        except IntegrityError as e:
            print(e)
            return jsonify({"error": f"Erro when registering user (duplicate?). {e}" }), 400
        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 500 
        

def get_user_settings(user_id):
    with DB_SESSION() as Session:
        print("V1")
        stm = (
    select(
        UserModel.nickname,
        UserModel.firstName,
        UserModel.email,
        UserModel.phone, 
        UserModel.lastName,
        UserModel.profilePhoto,
        UserModel.birthDate,
        UserModel.registrationDate
    )
    .where(UserModel.idUser == user_id)
)

        result = Session.execute(stm).mappings().one_or_none()
        print(result)
        return dict(result) if result else None

    
def get_full_address_data(user_id: int):
        with DB_SESSION() as session:

            query = (
                select(UserAddressModel)
                .options(
                    joinedload("addresses")
                        .joinedload("city")
                        .joinedload("state")
                        .joinedload("country")
                )
                .where(UserAddressModel.idUser == user_id)
            )

            result = session.execute(query).scalars().all()

            if not result:
                return None


            addresses = []
            for ua in result:
                addr = ua.addresses
                addresses.append({
                    "street": addr.street,
                    "district": addr.district,
                    "number": addr.number,
                    "city": addr.city.name,
                    "state": addr.city.state.name,
                    "country": addr.city.state.country.name,
                })

            return addresses
    

def change_password(email,new_password):
    with DB_SESSION() as Session:
        user_email = current_user.email
        if user_email == email:
            
            current_user.userPassword = generate_password_hash(new_password)
            db.session.commit()