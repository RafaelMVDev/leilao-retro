# Placeholder, apenas organizando aqui

from flask import Blueprint, render_template, request, redirect, url_for, flash
from controllers.login import * 

auth_bp = Blueprint(
    "login", __name__,
    template_folder="templates",
    static_folder="static",
    url_prefix="/login"
)

@auth_bp.route("/login", methods=["GET"]) # Rota responsavél por só retornar o html!
def login():
    pass

@auth_bp.route("/request-login", methods=["POST"]) # Rota responsavél por enviar os dados da pagina de login pro servidor!
def login():
    pass