import os
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

USER = ""
PASSWORD = ""
HOST = ""
PORT = ""
DATABASE = "marauction"

DATABASE_URI = f"mysql+pymysql://root:simba123@127.0.0.1:3306/marauction"
