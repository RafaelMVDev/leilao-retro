from src.models.UserModel import UserModel
from src.models.AddressModel import AddressModel
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
        "CEP":str,
        "district": str,
        "street": str,
        "number": str,
        "complement":str,

    }
    """ 
    for field in _user_obrigatory_fields:
        if not user_data.get(field):
            print(f"Campo obrigatorio faltante em user: {field}")
            return jsonify({"error": f"Campo obrigatorio faltante em user: {field}"}), 400
    for field in _addr_obrigatory_fields:
         if not addr_data.get(field):
            print(f"Campo obrigatorio faltante em addr: {field}")
            return jsonify({"error": f"Campo obrigatorio faltante em addr: {field}"}), 400
    print('Todos os campos passaram')
    # verifies if there is already an ocurrency in the db ( may change to unique raise error on the db later)
    
    existing = db.session.query(UserModel).filter_by(email=user_data.get("email")).first()
    print(existing)
    if existing:
        return jsonify({"error": "E-mail já cadastrado."}), 400

    #add hash here (CHANGE LATER)
    hashed_password = generate_password_hash(user_data.get("password"))
    # search for address or create new one if it doesn't exist
    cur_addr = False
    ex_address = AddressModel.query.filter_by(**addr_data).first()
    if ex_address:
        cur_addr = ex_address
    else:
        cur_addr = AddressModel(**addr_data)
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
        address = cur_addr #relationship magic!! finally 
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
