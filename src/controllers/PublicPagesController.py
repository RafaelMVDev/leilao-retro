from flask import render_template, request, redirect, url_for, session, Blueprint

from src.models.UserModel import UserModel


bp = Blueprint('public_pages', __name__)


def init():
    session['logado'] = False
    return session['logado']

@bp.route('/')
def default():
    if not session.get('logado'):
        init()
    if session['logado'] == False:
        return redirect(url_for('public_pages.homepage'))
    else:
        return redirect(url_for('private_pages.home'))
    
@bp.route('/homepage', methods=['POST','GET'])
def homepage():
    if request.method == 'GET':
        return render_template('public/homepage/homepage.html')
    else:
        pass
    
