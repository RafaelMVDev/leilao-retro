from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from src.models.UserModel import UserModel
from src.services.UserService import *

bp = Blueprint('auth_pages', __name__)



def init():
    session['logado'] = False
    return session['logado']

def beforeRequest(): # futuro decorador pra rotas que precisam de verificações antes de retornar o request
    pass 
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
    get_user_data(email = email, password= password)
    return jsonify("yea")


# Rotas da Pagina de Registro    
@bp.route('/register', methods=['GET'])
def register_page():
    return render_template('public/auth_pages/register.html')

@bp.route('/submit_register', methods=['POST'])
def submit_register():
    # adicionar validação do servidor aqui
    email = request.form.get("email")
    password = request.form.get("password")
    pass
        


    
