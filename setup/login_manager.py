from flask_login import LoginManager,logout_user,login_user,current_user
from flask import redirect,url_for,flash
from sqlalchemy import select


from werkzeug.security import check_password_hash
from functools import wraps

login_manager = LoginManager()
login_manager.login_view = "auth_pages.get_login"  # endpoint 



# ==== DECORATORS ==== 
def authenticated_only(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            flash("Você precisa estar logado para acessar!", "warning") 
            return redirect(url_for("auth_pages.login_page"))
        return f(*args, **kwargs)
    return decorated


def admin_only(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for("login"))
        if not getattr(current_user, "is_admin", False):
            flash("Acesso restrito a administradores.", "danger") # return page later
            return redirect(url_for("home"))
        return f(*args, **kwargs)
    return decorated