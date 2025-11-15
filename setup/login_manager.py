"""from flask_login import LoginManager
from setup.loaders.database import db

login_manager = LoginManager()
login_manager.login_view = "login"  # endpoint da página de login


@login_manager.user_loader
def load_user(user_id):
    # SQLAlchemy 2.0
    return db.session.get(UserModel, int(user_id))"""