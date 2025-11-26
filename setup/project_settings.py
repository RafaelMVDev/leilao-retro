
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore



load_dotenv()  # loads the dotenv

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS") == "True"

project_settings = {
    "LOCALE": "pt"
    
}

#Scheduler settings
jobstores = {
    'default': SQLAlchemyJobStore(
        url='mysql+pymysql://usuario:senha@localhost/leilao_retro'
    )
}

scheduler = BackgroundScheduler(jobstores=jobstores)