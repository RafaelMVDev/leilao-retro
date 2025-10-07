# Estrutura MVC com Flask

Este projeto segue uma arquitetura inspirada no padrão **MVC (Model-View-Controller)**, adaptado para o Flask. A ideia é manter uma separação clara entre as camadas de **rotas e renderização (views)**, **lógica de negócio (controllers)** e **acesso a dados (models)**.

---

## 🧩 Estrutura de Pastas

```
project/
│
├── app.py                  # Ponto de entrada da aplicação Flask
│
├── views/                  # Responsável pelas rotas e renderização
│   ├── __init__.py
│   ├── login/              # Cada view é uma Blueprint independente
│   │   ├── login.py        # Rotas específicas (usa funções do controller)
│   │   ├── templates/      # HTMLs da view
│   │   │   └── login.html
│   │   └── static/         # Arquivos estáticos (CSS, JS, imagens) da view
│   │       ├── login.css
│   │       └── login.js
│   └── ...
│
├── controllers/            # Lógica de negócio
│   ├── __init__.py
│   ├── login_controller.py # Exemplo: funções de autenticação e validação
│   └── ...
│
├── models/                 # Abstrações do banco de dados
│   ├── __init__.py
│   ├── usuario.py          # Representa a tabela "usuarios"
│   └── ...
│
└── README.md
```

---

## ⚙️ Funcionamento

### Views
- Cada **view** é uma **Blueprint** que contém:
  - Um arquivo Python (`.py`) com suas rotas;
  - Uma pasta `templates/` para seus HTMLs;
  - Uma pasta `static/` para seus JS, CSS e imagens.

### Controllers
- Responsáveis pela **lógica de negócio**;
- As views chamam funções dos controllers, que centralizam o comportamento da aplicação.



### Models
- Representam as **tabelas do banco de dados**;
- Cada model possui métodos próprios para criar, buscar e atualizar registros.

```


---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar. ( quem sabe um dia )
