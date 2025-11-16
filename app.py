from flask import Flask,request,redirect,url_for
import flask_login



from setup.db_configs import * # here is the instance of the db created with sqlalchemy ( please read the docstring of the database.py file ) 
from setup.loaders.database import init_db
from setup.loaders.load_controllers import load_controllers
from setup.loaders.load_models import load_models
from setup.loaders.load_services import load_services
from setup.login_manager import login_manager



def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI 
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = TRACK_MODIFICATIONS
    app.secret_key = b'_5#y2L"F4Q8z\n\xec]/' # Replace with a strong, randomly generated key
    #initalizing flask - login
   
    with app.app_context():
    # inicializando em ordem!
        init_db(app)
        load_models("src.models")
        load_services("src.services")
        login_manager.init_app(app)
   
        load_controllers(app,"src.controllers")

    return app

app = create_app()
@app.before_request
def verify_login():
    pass
if __name__ == '__main__':
    app.run(debug=True)

for rule in app.url_map.iter_rules():
    print(f"Endpoint: {rule.endpoint}, Methods: {rule.methods}, Rule: {rule.rule}")