from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from setup.db_configs import DATABASE_URI
from pytz import utc
jobstores = {
    'default': SQLAlchemyJobStore(
        url=DATABASE_URI
    )
}

scheduler = BackgroundScheduler(jobstores=jobstores,timezone = utc)