# Controlle responsavél pelas vies e ações login, logoff e sign in <-- tecnicanebt
from flask import Flask, render_template, request, session, redirect, url_for, Blueprint


login_controller = Blueprint("LoginController",__name__)




class LoginController():  # todos metodos vao ser static para nao ter que instanciar um objeto da clase, poder usar direto nela!
    #pega dados do model
    #verificação com service 
    # retorna view ou ajax
    @staticmethod
    def on_login_submit(request):
        print("executing!")
        return True
    