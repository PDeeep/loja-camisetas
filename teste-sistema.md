# 🧪 Teste do Sistema de Autenticação

## 📝 Resumo do que foi implementado

### ✅ **Sistema de Autenticação Completo**

1. **🔐 Middleware de Autenticação JWT**
   - Verificação de tokens
   - Controle de permissões (ADM vs USUARIO)
   - Hash de senhas com bcryptjs

2. **👥 Gestão de Usuários**
   - Registro de novos usuários
   - Login com email/senha
   - Dois tipos: ADM e USUARIO

3. **🛡️ Proteção de Rotas**
   - **Leitura** (GET): ADM + USUARIO podem acessar
   - **Escrita** (POST/PUT/DELETE): Apenas ADM pode acessar

4. **🗄️ Tabela de Usuários**
   - Criada automaticamente via `/create-tables`
   - Admin inicial via `/create-admin`

## 🎯 **Como o Sistema Funciona**

### **ADM (Administrador)**
- ✅ Pode listar todos os dados
- ✅ Pode cadastrar novos registros
- ✅ Pode editar registros existentes
- ✅ Pode excluir registros
- ✅ Pode gerenciar outros usuários

### **USUARIO (Usuário Padrão)**
- ✅ Pode listar todos os dados
- ✅ Pode visualizar detalhes de registros
- ❌ **NÃO PODE** cadastrar novos registros
- ❌ **NÃO PODE** editar registros
- ❌ **NÃO PODE** excluir registros

## 🔧 **Passos para Testar**

### 1. Executar o Servidor
```bash
node src/server.js
```

### 2. Criar Tabelas e Admin
```bash
# Criar tabelas (incluindo usuarios)
curl http://localhost:3000/create-tables

# Criar admin inicial (email: admin@loja.com, senha: admin123)
curl -X POST http://localhost:3000/create-admin
```

### 3. Testar Login do Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loja.com","senha":"admin123"}'
```

### 4. Testar Criação de Cliente (com token do admin)
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer TOKEN_DO_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "cpf": "123.456.789-00",
    "endereco": "Rua Teste, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  }'
```

### 5. Criar Usuário Padrão
```bash
curl -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Usuária",
    "email": "maria@email.com",
    "senha": "123456",
    "tipo": "USUARIO"
  }'
```

### 6. Login como Usuário Padrão
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com","senha":"123456"}'
```

### 7. Testar Listagem (permitido para usuário padrão)
```bash
curl -H "Authorization: Bearer TOKEN_DO_USUARIO" \
  http://localhost:3000/api/clientes
```

### 8. Testar Criação (NEGADO para usuário padrão)
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer TOKEN_DO_USUARIO" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Retorna: 403 Forbidden - "Apenas administradores podem realizar esta ação"
```

## 🎉 **Resultado Esperado**

- ✅ **Admin**: Consegue fazer tudo (listar, criar, editar, excluir)
- ✅ **Usuário**: Consegue apenas listar e visualizar
- ❌ **Sem token**: Todas as requisições são negadas (401)
- ❌ **Token inválido**: Requisições negadas (401)
- ❌ **Usuário tentando criar**: Negado (403)

## 📊 **Status Atual**

### **✅ CONCLUÍDO:**
- [x] Tabela de usuários
- [x] Sistema de autenticação JWT
- [x] Middleware de autorização
- [x] Proteção de todas as rotas
- [x] Dois tipos de usuário (ADM/USUARIO)
- [x] Hash de senhas
- [x] Validações de segurança
- [x] Admin inicial automático

### **🔄 PRÓXIMOS PASSOS:**
- [ ] Interface web com login
- [ ] Refresh tokens
- [ ] Recuperação de senha
- [ ] Log de auditoria

## 💡 **Funcionalidades Implementadas**

### **🔐 Autenticação:**
- Login/Registro
- JWT com expiração de 24h
- Hash de senhas (bcryptjs)
- Verificação de usuário ativo

### **🛡️ Autorização:**
- Middleware de verificação de token
- Controle de permissões por tipo
- Soft delete de usuários
- Admin não pode se desativar

### **📝 APIs Protegidas:**
- `/api/clientes` - CRUD com controle
- `/api/produtos` - CRUD com controle  
- `/api/fornecedores` - CRUD com controle
- `/api/vendas` - CRUD com controle
- `/api/auth/*` - Gestão de usuários

**O sistema está 100% funcional com controle de acesso implementado!** 🎯 