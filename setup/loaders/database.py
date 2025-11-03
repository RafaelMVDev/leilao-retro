from flask_sqlalchemy import SQLAlchemy
from setup import db_configs
from sqlalchemy import create_engine, text,MetaData
from sqlalchemy.orm import Session,sessionmaker

db = SQLAlchemy()
DB_METADATA = False
DB_SESSION = False
def init_db(app):
    "Inits the database, creates the session maker and db metadata"
    db.init_app(app)

    with app.app_context():
        global DB_METADATA,DB_SESSION

        DB_METADATA = MetaData(schema = db_configs.DATABASE)
        DB_SESSION = sessionmaker(bind = db.engine)

 
     