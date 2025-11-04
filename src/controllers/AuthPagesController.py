from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from src.models.UserModel import UserModel
from src.services.UserService import *

bp = Blueprint('auth_pages', __name__)



def init():
    session['logado'] = False
    return session['logado']

@bp.route('/')
def homepage():
    if not session.get('logado'):
        init()
    if session['logado'] == False:
        return redirect(url_for('public_pages.homepage'))
    else:
        return render_template('private_pages.home')
    
@bp.route('/login', methods=['GET'])
def login_page():

    return render_template('public/auth_pages/login.html')
   
            
@bp.route('/submit_login', methods=['POST'])
def submit_login():
    email = request.form.get("email")
    password = request.form.get("password")
    user = get_user_data(email = email, password= password)
    
    return jsonify(user)


# Rotas da Pagina de Registro    
@bp.route('/register', methods=['GET'])
def register_page():
    return render_template('public/auth_pages/register.html')

@bp.route('/submit_register', methods=['POST'])
def submit_register():
    print("recebendo dados!")
    data = dict(request.form.items())
    result = register_user(data) # function that validates the data and also commits the data to the db ( returns error if somehting went wrong)
    return result
        


    
