from src.models.UserModel import UserModel
from setup.loaders.database import DB_SESSION
from sqlalchemy import select
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
from datetime import datetime

from setup.loaders.database import db  

obrigatory_fields =  [   # reference table to verify if there is any missing fields that are obrigatory
        "nickname",
        "firstName",
        "lastName",
        "email",
        "password",
        "phone",
        "birthDate",
        
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
def register_user(user_data: dict) -> int | dict:
    """
    Receives a dictionary with the user fields and registers it into the bank.
    Exemplo de user_data:
    {
        "nickname": "rafa",
        "firstName": "Rafael",
        "lastName": "Villela",
        "email": "rafael@example.com",
        "password": "123456",
        "profilePhoto": "foto.png",
        "phone": "11999999999",
        "birthDate": "2006-09-18",
        "fkAddressIdAddress": 1
    }
    """ 
    for field in obrigatory_fields:
        if not user_data.get(field):
            return jsonify({"error": f"Campo obrigatorio faltante: {field}"}), 400
    # verifies if there is already an ocurrency in the db ( may change to unique raise error on the db later)
    
    existing = db.session.query(UserModel).filter_by(email=user_data.get("email")).first()
    print(existing)
    if existing:
        return jsonify({"error": "E-mail já cadastrado."}), 400

    #add hash here (CHANGE LATER)
    hashed_password = generate_password_hash(user_data.get("password"))

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
        fkAddressIdAddress=user_data.get("fkAddressIdAddress")
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
