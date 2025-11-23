from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from src.models.UserModel import UserModel
from src.services.UserService import *
from setup.login_manager import  *
from setup.login_manager import login_manager
from src.services.EmailService import generate_token, send_email,confirm_token


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
    
    sucess = authenticate_user(db_session= DB_SESSION(),email = email,password=password)
    print(f"USER AUTHENTICATED? {sucess}")
    return redirect(url_for("profile_pages.get_profile_page"))


# Rotas da Pagina de Registro    
@bp.route('/register', methods=['GET'])
def register_page():
    return render_template('public/auth_pages/register.html')

@bp.route('/submit_register', methods=['POST'])
def submit_register():
    print("recebendo dados!")
    data = request.get_json()
    result = False
    user_data = data.get("user_data")
    addr_data = data.get("addr_data")
   
    if user_data and addr_data:
        result = register_user(user_data=user_data, addr_data=addr_data) # function that validates the data and also commits the data to the db ( returns error if somehting went wrong)
    print(result)
    return jsonify("Deu certo?")


@bp.route("/reset_password/<token>", methods=["GET","POST"])
def reset_password(token):

    email = confirm_token(token)
    if not email:
        return "Token inválido ou expirado", 400

    if request.method == "POST":
        # UserService (changepassword)
        data = request.get_json()
        new_password = data.get("password")
        change_password(email,new_password=new_password)
        
        return jsonify("Senha redefinida com sucesso!")

    return render_template("public/auth_pages/reset_password.html")

@bp.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        data = request.get_json()
        email = data.get("email")
        user = UserModel.query.filter_by(email=email).first()

        if not user:
            return jsonify("Email não encontrado"), 404
        print("MANDANDO EMAIL")
        token = generate_token(email)
        reset_url = f"http://127.0.0.1:5000{url_for('auth_pages.reset_password',token = token)}"

        html = f"""
        <h3>Reset de senha</h3>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="{reset_url}">{reset_url}</a>
        """
        print("Enviando-email!!")
        send_email(email, "Redefinir senha", html)
        return jsonify("E-mail enviado com sucesso!")

    return render_template("public/auth_pages/forgot_password.html")

@bp.route("/confirm_email/<token>")
def confirm_email(token):
    with DB_SESSION() as Session:
        email = confirm_token(token)
        if not email:
            return "Token inválido ou expirado", 400
        
        user = UserModel.query.filter_by(email=email).first()
        if not user:
            return "Usuário não encontrado", 404

        user.isAuthenticated = True
        db.session.commit()
        return render_template("private/auth/email_confirmed.html")



