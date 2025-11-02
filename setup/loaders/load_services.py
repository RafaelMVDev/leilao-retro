import importlib
import pkgutil
import os


def load_services(package_name):
    """Carrega automaticamente todos os Blueprints (bp) da pasta controllers e os registra no app."""
    print(package_name)


    package = importlib.import_module(package_name)
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if not is_pkg:
            full_module_name = f"{package_name}.{module_name}"
            module = importlib.import_module(full_module_name)

        
