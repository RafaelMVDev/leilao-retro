from flask import render_template, request, redirect, url_for, session, Blueprint,jsonify
from setup.login_manager import  *
from src.services.UserService import *
from setup.login_manager import login_manager
from src.services.EmailService import generate_token, send_email,confirm_token
bp = Blueprint('profile_pages', __name__)

temporary_wallet_data = {
    "wallet_external": {"currentBalance": 0},
    "wallet_internal": {"currentBalance": 0}
}
@bp.route('/profile_settings', methods=['GET'])
@authenticated_only # check
def get_profile_page():
    user_data = session.get("user_data")
    profile_settings = user_data.get("profile_settings")
    address_data = user_data.get("address_data")
    wallets_data = user_data.get("wallets_data")
    print("testss")
    print(wallets_data if wallets_data else temporary_wallet_data)
    return render_template('private/profile/profile.html',
                           profile_settings = profile_settings,
                           address_data = address_data,
                           wallets_data = wallets_data if wallets_data else temporary_wallet_data )


@bp.route('/submit_logout', methods=['POST'])
@authenticated_only
def submit_logout():
    print("Logging off")
    logout()
    return redirect(url_for("auth_pages.login_page"))

@bp.route("/reset_password/<token>", methods=["GET","POST"])
@authenticated_only # check
def reset_password(token):

    email = confirm_token(token)
    if not email:
        return "Token inválido ou expirado", 400

    if request.method == "POST":
        # UserService (changepassword)
        new_password = request.form.get("password")
        change_password(email,new_password=new_password)
        
        return jsonify("Senha redefinida com sucesso!")

    return render_template("private/auth/reset_password.html")

@bp.route("/forgot_password", methods=["GET", "POST"])

@authenticated_only # check
def forgot_password():
    if request.method == "POST":
        data = request.get_json()
        email = data.get("email")
        user = UserModel.query.filter_by(email=email).first()

        if not user:
            return jsonify("Email não encontrado"), 404

        token = generate_token(email)
        reset_url = f"http://127.0.0.1:5000{url_for('profile_pages.reset_password',token = token)}"

        html = f"""
        <h3>Reset de senha</h3>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="{reset_url}">{reset_url}</a>
        """
        print("Enviando-email!!")
        send_email(email, "Redefinir senha", html)
        return jsonify("E-mail enviado com sucesso!")

    return render_template("private/auth/forgot_password.html")


