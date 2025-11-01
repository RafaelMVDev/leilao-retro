from setup.loaders.database import db,DB_METADATA,DB_SESSION
from sqlalchemy.orm import Mapped, mapped_column # Mapped aparentemente é um tipo que é usada puramente pra deixar o codigo mais pythonico, e mapped_column é pra relacionar 
from sqlalchemy import inspect
from sqlalchemy import create_engine
from sqlalchemy import Table,Column,select


class ImageModel(db.Model):
    #__table_args__ = {"schema": "bares"}   Define o schema aqui
    #idEstabelecimento: Mapped[int] = Column(primary_key = True)
    
    __table__ = Table("image",DB_METADATA,autoload_with=db.engine)
    
    #FUNCIONOU GRAÇASSSSSSSSSSSSSS A DEUS 
    @classmethod
    def get_all(classe):
        query = select(classe)
        estabelecimentos = DB_SESSION.execute(query).scalars().all()
        for est in estabelecimentos:
            print(est.idEstabelecimento, est.nome_enc) 
        return DB_SESSION.execute(query).scalars().all()
    @classmethod
    def get_estabelecimento(id_estabelecimento: int):
        return db.Query.get(id_estabelecimento)
    
    @classmethod
    def get_db_info():
        inspector = inspect(db.engine)
        tables = inspector.get_table_names(schema="nome_do_banco")
        print(tables)
