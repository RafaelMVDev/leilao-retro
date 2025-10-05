# ==== Bibliotecas ====
from flask import Flask,jsonify, render_template, request, session, redirect, url_for
from json import loads,load

import random
import secrets

# - Blueprints -



app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Registrando as Blueprints aqui


@app.route("/")
def index():
    
    return render_template('index.html')

if __name__ == 'main':
    print("WHAT")
    for rule in app.url_map.iter_rules():
            print(f"Endpoint: {rule.endpoint}, Methods: {rule.methods}, Rule: {rule.rule}")
    app.run(debug = True)

for rule in app.url_map.iter_rules():
    print(f"Endpoint: {rule.endpoint}, Methods: {rule.methods}, Rule: {rule.rule}")