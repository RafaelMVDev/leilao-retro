import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer
from setup.project_settings import *

serializer = URLSafeTimedSerializer("CHAVE_SECRETA_AQUI")

def send_email(to, subject, html):
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to

    server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
    server.starttls()
    server.login(EMAIL_USER, EMAIL_PASSWORD)
    server.sendmail(EMAIL_USER, to, msg.as_string())
    server.quit()


def generate_token(email):
    return serializer.dumps(email, salt="email-confirm")


def confirm_token(token, expiration=3600):
    try:
        email = serializer.loads(token, salt="email-confirm", max_age=expiration)
    except:
        return False
    return email