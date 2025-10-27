from flask_sqlalchemy import SQLAlchemy
from setup import db_configs
db = SQLAlchemy()
from sqlalchemy import create_engine, text,MetaData
from sqlalchemy.orm import Session


DB_METADATA = False
DB_SESSION = False
def init_db(app):
    """Inicializa o banco e reflete tabelas existentes."""
    """Inicializa o banco e reflete tabelas existentes no schema 'bares'."""
    db.init_app(app)

    with app.app_context():
        # Cria as tabelas do metadata atual (apenas se estiver usando __tablename__ nos modelos)
        global DB_METADATA,DB_SESSION

        DB_METADATA = MetaData(schema = db_configs.DATABASE)

        DB_SESSION = Session(db.engine)
        pass
        # Refletindo especificamente o schema 'bares'
        #metadata_bares = MetaData(schema="bares")  # sem bind aqui
        #metadata_bares.reflect(bind=db.engine)      # bind passado aqui

        #print("Tabelas refletidas no schema 'bares':", metadata_bares.tables.keys())

        # Checando database e schema atuais
     
    """db.init_app(app)
    with app.app_context():
        metadata_bares = MetaData(schema="bares")
        db.create_all()
        metadata_bares.reflect(bind=db.engine)

        print("Tabelas refletidas no schema 'bares':", metadata_bares.tables.keys())
        print(db.metadata.tables.keys())
        with db.engine.connect() as conn:
    # Para executar queries em SQL puro, sempre use text()
            current_db = conn.execute(text("SELECT current_database();")).scalar()
            current_schema = conn.execute(text("SELECT current_schema();")).scalar()

            print("Banco atual:", current_db)
            print("Schema atual:", current_schema)
"""
