# Dados de Exemplo para Teste do CRUD

## 📋 Como Usar
1. Acesse: http://localhost:3000
2. Use os dados abaixo para testar cada funcionalidade

## 👥 Clientes (Exemplo)

### Cliente 1
- **Nome**: João Silva Santos
- **Email**: joao.silva@email.com
- **Telefone**: (11) 99999-1234
- **CPF**: 123.456.789-00
- **Endereço**: Rua das Flores, 123, Jardim das Rosas
- **Cidade**: São Paulo
- **Estado**: SP
- **CEP**: 01234-567

### Cliente 2
- **Nome**: Maria Oliveira Costa
- **Email**: maria.oliveira@email.com
- **Telefone**: (11) 88888-5678
- **CPF**: 987.654.321-00
- **Endereço**: Avenida Paulista, 456, Centro
- **Cidade**: São Paulo
- **Estado**: SP
- **CEP**: 01310-100

## 🏢 Fornecedores (Exemplo)

### Fornecedor 1
- **Nome**: Tecidos Brasil LTDA
- **Razão Social**: Tecidos Brasil Indústria e Comércio LTDA
- **CNPJ**: 12.345.678/0001-90
- **Email**: contato@tecidosbrasil.com.br
- **Telefone**: (11) 3333-4444

### Fornecedor 2
- **Nome**: Malhas Premium
- **Razão Social**: Malhas Premium Indústria Têxtil LTDA
- **CNPJ**: 98.765.432/0001-10
- **Email**: vendas@malhaspremium.com.br
- **Telefone**: (11) 2222-3333

## 👕 Produtos (Exemplo)

### Produto 1
- **Nome**: Camiseta Básica Algodão
- **Categoria**: basica
- **Descrição**: Camiseta 100% algodão, macia e confortável para o dia a dia
- **Preço**: 29.90
- **Estoque**: 100
- **Tamanhos Disponíveis**: P,M,G,GG
- **Cores Disponíveis**: Branco,Preto,Azul

### Produto 2
- **Nome**: Camiseta Personalizada Eventos
- **Categoria**: personalizada
- **Descrição**: Camiseta para personalização com estampas e logos personalizados
- **Preço**: 45.00
- **Estoque**: 50
- **Tamanhos Disponíveis**: P,M,G,GG,XG
- **Cores Disponíveis**: Branco,Preto,Verde,Vermelho

## 💰 Vendas (Exemplo)

### Venda 1
- **ID do Cliente**: 1 (usar o ID do cliente cadastrado)
- **ID do Produto**: 1 (usar o ID do produto cadastrado)
- **Quantidade**: 2
- **Tamanho**: M
- **Cor**: Branco
- **Preço Unitário**: 29.90
- **Endereço de Entrega**: Rua das Flores, 123, Jardim das Rosas, São Paulo - SP

### Venda 2
- **ID do Cliente**: 2 (usar o ID do cliente cadastrado)
- **ID do Produto**: 2 (usar o ID do produto cadastrado)
- **Quantidade**: 1
- **Tamanho**: G
- **Cor**: Azul
- **Preço Unitário**: 45.00
- **Endereço de Entrega**: Avenida Paulista, 456, Centro, São Paulo - SP

## 🚀 Sequência de Teste Recomendada

1. **Primeiro**: Cadastre os fornecedores
2. **Segundo**: Cadastre os clientes
3. **Terceiro**: Cadastre os produtos (pode usar o ID dos fornecedores cadastrados)
4. **Quarto**: Cadastre as vendas (usando IDs de clientes e produtos já cadastrados)
5. **Quinto**: Use os botões "Listar" para ver todos os dados

## 📱 Funcionalidades Disponíveis

### ✅ Implementado
- ✅ Cadastro de Clientes (CREATE)
- ✅ Listagem de Clientes (READ)
- ✅ Cadastro de Produtos (CREATE)
- ✅ Listagem de Produtos (READ)
- ✅ Cadastro de Fornecedores (CREATE)
- ✅ Listagem de Fornecedores (READ)
- ✅ Cadastro de Vendas (CREATE)
- ✅ Listagem de Vendas (READ)

### 🔄 Disponível via API (mas não na interface)
- Buscar por ID (GET /api/{entidade}/{id})
- Atualizar registros (PUT /api/{entidade}/{id})
- Excluir registros (DELETE /api/{entidade}/{id})

## 🌐 URLs das APIs

- **Clientes**: http://localhost:3000/api/clientes
- **Produtos**: http://localhost:3000/api/produtos  
- **Fornecedores**: http://localhost:3000/api/fornecedores
- **Vendas**: http://localhost:3000/api/vendas

## 🎯 Testando as APIs Diretamente

Você pode testar as APIs usando ferramentas como Postman ou curl:

```bash
# Listar clientes
curl http://localhost:3000/api/clientes

# Buscar cliente por ID
curl http://localhost:3000/api/clientes/1

# Cadastrar novo cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste", "email": "teste@email.com", ...}'
``` 