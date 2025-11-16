import importlib
import pkgutil
import os


def load_controllers(app, package_name):
    """Automatically loads the controllers and loads them as bp for the app"""
    print(package_name)


    package = importlib.import_module(package_name)
    def recursive_search_controllers(package,pkg_name):

        for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
            full_module_name = f"{pkg_name}.{module_name}"
            if is_pkg:
               
                pkg = importlib.import_module(full_module_name)
                recursive_search_controllers(pkg,full_module_name)
            else:
                module = importlib.import_module(full_module_name)
        
                # Verifica se o módulo define um Blueprint chamado 'bp'
                bp = getattr(module, "bp", None)
                if bp:
                    app.register_blueprint(bp)
            
                
           
    recursive_search_controllers(package,package_name) # boot recursvie beautiful