import importlib
import pkgutil
import os


def load_controllers(app, package_name):
    """Automatically loads the controllers and loads them as bp for the app"""
    print(package_name)


    package = importlib.import_module(package_name)
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if not is_pkg:
            full_module_name = f"{package_name}.{module_name}"
            module = importlib.import_module(full_module_name)

            # Verifica se o módulo define um Blueprint chamado 'bp'
            bp = getattr(module, "bp", None)
            if bp:
                app.register_blueprint(bp)