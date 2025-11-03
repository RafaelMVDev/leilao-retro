import importlib
#import os
import pkgutil

# carrega os modulos que estão em um folder
def load_models(package: str):
    """Automatically loads the models from the models folder by importing them"""
    imp_package = importlib.import_module(package)

    for _, module_name, is_pkg in pkgutil.iter_modules(imp_package.__path__): # pkgutil uitera pelos modulos
        if not is_pkg: 
            full_module_name = f"{package}.{module_name}"
            print(full_module_name)
            importlib.import_module(full_module_name)
            