from dotenv import load_dotenv
import os

load_dotenv()  # loads the dotenv
"""
Explaining the URI for later configuration if necessary (based on the example below):

Example: mysql+pymysql://root@localhost:3306/bares

mysql is the database type, pymysql is the py library that handles the connection (sqlalchemy doesn't handle the connection, the driver does!).
root - username accessing the database (in this case, root is the admin user by default)
@localhost - indicates the host accessing the database (in this case, since the host is our own PC, I use localhost)
3306 - the port being accessed
/bares - the database schema being accessed
"""

TRACK_MODIFICATIONS = False
# Keep this if we're gonna use the online postgres database
#DATABASE_URI = "postgresql+psycopg2://postgres:senhamuitolegal123@db.nxyjokppbgznunayrgaz.supabase.co:5432/postgres"
#TODO: add db sensitive information via environment variables

USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DATABASE = os.getenv("DATABASE")
DB_CONN_DRIVER = os.getenv("DB_CONNECTION_DRIVER")
RDBMS = os.getenv("RDBMS")

DATABASE_URI = f"{RDBMS}+{DB_CONN_DRIVER}://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"