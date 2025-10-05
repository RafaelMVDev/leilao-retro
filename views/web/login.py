from flask import Flask, render_template, request, session, redirect, url_for, Blueprint

login_bp = Blueprint("login",__name__, template_folder= 'templates')