"""Isso aqui é basicamente um carregador de controllers. Ele vai puxar todos os controllers e deixar eles centralizados em 
um unico arquivo modulo. Ou seja, de um modulo só, vou poder acessar todos os controllers
Ex: from Controllers import UserController,LoginController <-- cada controller no seu arquivo py, mas vao ser centralizados no controllers
"""

import os # importante pra lidar com os sistema de diretórios do loader
import importlib # vai ser necessário pra chamar o import nos arquivos
_current_dir = os.path.dirname(__name__)


_loaded_controllers = {} # vai guardar os controllers carregados ( no fim são só classes )

for file in os.listdir(_current_dir):
    if file.endswith(".py") and file != "__init__.py": # so pra confirmar se é um arquivo py e é diferente do init
        _controller_name = file[:-3] 
        _controller_path = f'{__name__}.{_controller_name}'
        module = importlib.import_module(_controller_path)
        for atr_name in dir(module): #vai listar tudo que tem no objeto de modulo
            attr = getattr(module,atr_name)
            if isinstance(attr,type) and not atr_name.startswith("_"): #attr = type significa que é classe
                #nesse caso é uma classe, e não uma função ou alguma coisa reservada do python
                globals()[atr_name] = attr # adiciona a classe como variavel global dentro do modulo!