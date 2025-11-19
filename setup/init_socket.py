# init_socket.py
from flask_socketio import SocketIO

socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="eventlet"  # ou "gevent" ou "threading", dependendo do seu servidor
)

def init_socket(app):
    """Inicializa o socket integrado ao app Flask"""
    socketio.init_app(app)
    return socketio