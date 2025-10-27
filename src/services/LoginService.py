# Controlle responsavél pelas vies e ações login, logoff e sign in <-- tecnicanebt



class LoginController():  # todos metodos vao ser static para nao ter que instanciar um objeto da clase, poder usar direto nela!
    @staticmethod
    def on_login_submit(request):
        print("executing!")
        return True
    