# 🛍️ Sistema de Gestão - Loja de Camisetas

Sistema completo de gestão para loja de camisetas desenvolvido em Node.js com Express, PostgreSQL e interface web responsiva.

## 🚀 Funcionalidades

### 📋 Módulos Principais
- **👥 Gestão de Clientes** - Cadastro, edição e visualização de clientes
- **🛍️ Gestão de Produtos** - Controle de estoque e produtos
- **🏢 Gestão de Fornecedores** - Cadastro de fornecedores
- **💰 Gestão de Vendas** - Registro completo de vendas
- **👤 Gestão de Usuários** - Sistema de autenticação e autorização

### 🔐 Sistema de Autenticação
- **ADM**: Acesso completo (criar, editar, excluir, visualizar)
- **USUARIO**: Apenas visualização de dados

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Sequelize (com queries SQL raw)
- **Autenticação**: JWT (JSON Web Tokens)
- **Criptografia**: bcryptjs
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Interface**: Design responsivo e moderno

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/loja-camisetas.git
cd loja-camisetas
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
- Crie um banco PostgreSQL
- Configure as variáveis de ambiente no arquivo `config.env`

4. **Configure as variáveis de ambiente**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loja_camisetas
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta
```

5. **Inicie o servidor**
```bash
npm start
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **usuarios**: Sistema de autenticação
- **clientes**: Dados dos clientes
- **produtos**: Catálogo de produtos
- **fornecedores**: Cadastro de fornecedores
- **vendas**: Registro de vendas

## 🚀 Como Usar

1. **Acesse o sistema**: http://localhost:3000
2. **Crie o usuário admin**: http://localhost:3000/create-admin
3. **Faça login** com as credenciais criadas
4. **Comece a usar** os módulos disponíveis

## 📁 Estrutura do Projeto

```
loja-camisetas/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── CategoriaController.js
│   │   ├── ProdutoController.js
│   │   └── TagController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── associations.js
│   │   ├── Categoria.js
│   │   ├── ItemPedido.js
│   │   ├── Pedido.js
│   │   ├── Produto.js
│   │   ├── ProdutoTag.js
│   │   ├── Tag.js
│   │   └── Usuario.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categorias.js
│   │   ├── produtos.js
│   │   └── tags.js
│   └── server.js
├── views/
│   ├── layouts/
│   │   └── main.handlebars
│   ├── partials/
│   ├── categorias.handlebars
│   ├── error.handlebars
│   ├── login.handlebars
│   ├── produtos.handlebars
│   └── tags.handlebars
├── package.json
├── config.env
└── README.md
```

## 🔧 Rotas da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Excluir produto

### Fornecedores
- `GET /api/fornecedores` - Listar fornecedores
- `POST /api/fornecedores` - Criar fornecedor
- `PUT /api/fornecedores/:id` - Atualizar fornecedor
- `DELETE /api/fornecedores/:id` - Excluir fornecedor

### Vendas
- `GET /api/vendas` - Listar vendas
- `POST /api/vendas` - Criar venda
- `PUT /api/vendas/:id` - Atualizar venda
- `DELETE /api/vendas/:id` - Excluir venda

## 🎨 Interface

- Design responsivo e moderno
- Modais para edição e exclusão
- Validação de formulários
- Feedback visual para ações
- Sistema de permissões integrado

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas com bcrypt
- Middleware de autorização
- Validação de dados
- Proteção contra SQL injection

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvedor

Desenvolvido por Pedro Henrique

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!** 