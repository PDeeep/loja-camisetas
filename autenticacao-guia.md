# 🔐 Sistema de Autenticação - Loja de Camisetas

## 📋 Visão Geral

O sistema agora possui **controle de autenticação completo** com dois tipos de usuário:

- **👤 ADM**: Pode criar, editar e excluir todos os dados
- **👥 USUARIO**: Pode apenas visualizar os dados (modo somente leitura)

## 🚀 Configuração Inicial

### 1. Executar o Servidor
```bash
node src/server.js
```

### 2. Criar as Tabelas (incluindo usuários)
```bash
curl http://localhost:3000/create-tables
```

### 3. Criar Usuário Administrador Inicial
```bash
curl -X POST http://localhost:3000/create-admin
```

**Credenciais do Admin:**
- **Email**: `admin@loja.com`
- **Senha**: `admin123`

## 🔗 Endpoints de Autenticação

### 📝 Registrar Novo Usuário
```bash
POST /api/auth/registrar
Content-Type: application/json

{
  "nome": "Nome do Usuário",
  "email": "usuario@email.com", 
  "senha": "senha123",
  "tipo": "USUARIO"  // ou "ADM"
}
```

### 🔑 Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@loja.com",
  "senha": "admin123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "usuario": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@loja.com",
      "tipo": "ADM"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 👤 Perfil do Usuário Logado
```bash
GET /api/auth/perfil
Authorization: Bearer SEU_TOKEN_JWT
```

### 📊 Listar Usuários (Apenas ADM)
```bash
GET /api/auth/usuarios
Authorization: Bearer TOKEN_DO_ADM
```

### 🔄 Ativar/Desativar Usuário (Apenas ADM)
```bash
PATCH /api/auth/usuarios/2/status
Authorization: Bearer TOKEN_DO_ADM
```

## 🛡️ Como Usar a Autenticação

### 1. Obter Token JWT
Faça login para receber o token:

```javascript
const loginData = {
  email: "admin@loja.com",
  senha: "admin123"
};

fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(res => res.json())
.then(data => {
  const token = data.data.token;
  // Salvar token para usar nas próximas requisições
});
```

### 2. Usar Token nas Requisições
Inclua o token no header `Authorization`:

```javascript
fetch('/api/clientes', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### 3. Criar Dados (Apenas ADM)
```javascript
// Só funciona com token de usuário ADM
fetch('/api/clientes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenADM}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: "Cliente Teste",
    email: "cliente@test.com",
    // ... outros dados
  })
});
```

## 🔒 Controle de Acesso por Rota

### 📖 **Rotas de Leitura** (ADM + USUARIO)
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Buscar cliente
- `GET /api/produtos` - Listar produtos  
- `GET /api/produtos/:id` - Buscar produto
- `GET /api/fornecedores` - Listar fornecedores
- `GET /api/fornecedores/:id` - Buscar fornecedor
- `GET /api/vendas` - Listar vendas
- `GET /api/vendas/:id` - Buscar venda

### ✏️ **Rotas de Escrita** (APENAS ADM)
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Excluir produto
- `POST /api/fornecedores` - Criar fornecedor
- `PUT /api/fornecedores/:id` - Atualizar fornecedor
- `DELETE /api/fornecedores/:id` - Excluir fornecedor
- `POST /api/vendas` - Criar venda
- `PUT /api/vendas/:id` - Atualizar venda
- `DELETE /api/vendas/:id` - Cancelar venda

## 🎯 Exemplos Práticos

### Cenário 1: Usuário ADM
```bash
# 1. Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loja.com","senha":"admin123"}'

# 2. Criar cliente (permitido)
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com",...}'

# 3. Listar clientes (permitido)
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/clientes
```

### Cenário 2: Usuário Padrão
```bash
# 1. Criar usuário padrão
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria@email.com","senha":"123456","tipo":"USUARIO"}'

# 2. Login como usuário padrão
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}'

# 3. Listar clientes (permitido)
curl -H "Authorization: Bearer TOKEN_USUARIO" \
  http://localhost:3000/api/clientes

# 4. Tentar criar cliente (NEGADO - retorna erro 403)
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer TOKEN_USUARIO" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## ⚡ Códigos de Resposta

### ✅ Sucesso
- `200` - Operação realizada com sucesso
- `201` - Recurso criado com sucesso

### ❌ Erros de Autenticação
- `401` - Token não fornecido ou inválido
- `403` - Acesso negado (usuário sem permissão)
- `404` - Usuário não encontrado

### 🔄 Respostas de Erro
```json
{
  "success": false,
  "message": "Acesso negado. Apenas administradores podem realizar esta ação.",
  "code": "ADMIN_REQUIRED"
}
```

## 🔧 Configurações de Segurança

### JWT Token
- **Expiração**: 24 horas
- **Algoritmo**: HS256  
- **Chave secreta**: Configurável via `JWT_SECRET`

### Senhas
- **Hash**: bcryptjs com salt de 12 rounds
- **Validação**: Obrigatória no registro

### Banco de Dados
- **Soft Delete**: Usuários são desativados, não excluídos
- **Constraints**: Email único por usuário
- **Auditoria**: Campos created_at e updated_at

## 🛠️ Próximos Passos

1. **Interface Web**: Atualizar para incluir tela de login
2. **Refresh Token**: Implementar renovação automática
3. **Recuperação de Senha**: Sistema de reset via email
4. **Log de Auditoria**: Registrar ações dos usuários
5. **Sessões**: Controle de sessões ativas

## 🔍 Testando o Sistema

1. Crie o admin inicial
2. Registre um usuário padrão
3. Teste login com ambos os tipos
4. Tente operações de leitura e escrita
5. Verifique as permissões de cada tipo

O sistema está **100% funcional** com controle de acesso completo! 🎉 