const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (interface web)
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const produtosRoutes = require('./routes/produtos');
const fornecedoresRoutes = require('./routes/fornecedores');
const vendasRoutes = require('./routes/vendas');

// Usar rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/vendas', vendasRoutes);

// Rota principal - redirecionar para interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de informações da API
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 API da Loja de Camisetas funcionando!',
    status: 'online',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL conectado',
    autenticacao: 'JWT implementado',
    endpoints: {
      autenticacao: {
        registrar: 'POST /api/auth/registrar',
        login: 'POST /api/auth/login',
        perfil: 'GET /api/auth/perfil',
        usuarios: 'GET /api/auth/usuarios (ADM)',
        status: 'PATCH /api/auth/usuarios/:id/status (ADM)'
      },
      clientes: 'GET/POST/PUT/DELETE /api/clientes',
      produtos: 'GET/POST/PUT/DELETE /api/produtos',
      fornecedores: 'GET/POST/PUT/DELETE /api/fornecedores',
      vendas: 'GET/POST/PUT/DELETE /api/vendas'
    },
    acesso: {
      leitura: 'ADM e USUARIO podem listar e visualizar dados',
      escrita: 'Apenas ADM pode criar, editar e excluir'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rota para criar tabelas manualmente (incluindo tabela de usuários)
app.get('/create-tables', async (req, res) => {
  try {
    console.log('🔄 Criando tabelas...');
    
    // Criar tabela usuários
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(10) CHECK (tipo IN ('ADM', 'USUARIO')) DEFAULT 'USUARIO',
        ativo BOOLEAN DEFAULT true,
        ultimo_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela clientes (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telefone VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(50),
        estado VARCHAR(2),
        cep VARCHAR(10),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela fornecedores (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        razao_social VARCHAR(100),
        cnpj VARCHAR(18),
        email VARCHAR(100),
        telefone VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(50),
        estado VARCHAR(2),
        cep VARCHAR(10),
        tipo_fornecimento VARCHAR(50),
        prazo_entrega INTEGER,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela produtos (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        estoque INTEGER NOT NULL DEFAULT 0,
        categoria VARCHAR(50),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela vendas (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        numero_pedido VARCHAR(20) UNIQUE NOT NULL,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        tamanho VARCHAR(5),
        cor VARCHAR(30),
        preco_unitario DECIMAL(10,2) NOT NULL,
        preco_total DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) DEFAULT 0,
        forma_pagamento VARCHAR(50),
        endereco_entrega TEXT,
        observacoes TEXT,
        status VARCHAR(20) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabelas criadas com sucesso!');
    res.json({
      success: true,
      message: 'Tabelas criadas com sucesso!',
      tabelas: ['usuarios', 'clientes', 'fornecedores', 'produtos', 'vendas']
    });
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tabelas',
      error: error.message
    });
  }
});

// Rota para verificar tabelas existentes
app.get('/check-tables', async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'clientes', 'fornecedores', 'produtos', 'vendas')
      ORDER BY table_name;
    `);
    
    res.json({
      message: '📊 Status das tabelas',
      tabelas_existentes: result[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '❌ Erro ao verificar tabelas',
      message: error.message
    });
  }
});

// Rota para criar usuário administrador inicial (GET e POST)
app.get('/create-admin', async (req, res) => {
  try {
    const { hashSenha } = require('./middleware/auth');
    
    const nome = 'Administrador';
    const email = 'admin@loja.com';
    const senha = 'admin123';
    
    // Verificar se já existe um admin
    const [adminExistente] = await sequelize.query(`
      SELECT id FROM usuarios WHERE email = :email
    `, {
      replacements: { email }
    });

    if (adminExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuário administrador já existe'
      });
    }

    const senhaHash = await hashSenha(senha);

    const [resultado] = await sequelize.query(`
      INSERT INTO usuarios (nome, email, senha, tipo)
      VALUES (:nome, :email, :senha, 'ADM')
      RETURNING id, nome, email, tipo, created_at
    `, {
      replacements: { nome, email, senha: senhaHash }
    });

    res.status(201).json({
      success: true,
      message: 'Usuário administrador criado com sucesso',
      data: {
        id: resultado[0].id,
        nome: resultado[0].nome,
        email: resultado[0].email,
        tipo: resultado[0].tipo
      },
      credenciais: {
        email: 'admin@loja.com',
        senha: 'admin123'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar administrador',
      error: error.message
    });
  }
});

// Rota para recriar tabelas (SIMPLIFICADAS)
app.get('/recreate-tables', async (req, res) => {
  try {
    console.log('🔄 Recriando tabelas com esquema simplificado...');
    
    // Dropar tabelas existentes (se existirem)
    await sequelize.query(`DROP TABLE IF EXISTS vendas CASCADE`);
    await sequelize.query(`DROP TABLE IF EXISTS produtos CASCADE`);
    await sequelize.query(`DROP TABLE IF EXISTS fornecedores CASCADE`);
    await sequelize.query(`DROP TABLE IF EXISTS clientes CASCADE`);
    await sequelize.query(`DROP TABLE IF EXISTS usuarios CASCADE`);
    
    console.log('🗑️ Tabelas antigas removidas');
    
    // Criar tabela usuarios
    await sequelize.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo VARCHAR(20) DEFAULT 'USUARIO',
        ativo BOOLEAN DEFAULT true,
        ultimo_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela clientes (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telefone VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(50),
        estado VARCHAR(2),
        cep VARCHAR(10),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela fornecedores (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE fornecedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        razao_social VARCHAR(100),
        cnpj VARCHAR(18),
        telefone VARCHAR(20),
        email VARCHAR(100),
        endereco TEXT,
        cidade VARCHAR(50),
        estado VARCHAR(2),
        cep VARCHAR(10),
        tipo_fornecimento VARCHAR(50),
        prazo_entrega INTEGER,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela produtos (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE produtos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        estoque INTEGER NOT NULL DEFAULT 0,
        categoria VARCHAR(50),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Criar tabela vendas (SIMPLIFICADA)
    await sequelize.query(`
      CREATE TABLE vendas (
        id SERIAL PRIMARY KEY,
        numero_pedido VARCHAR(20) UNIQUE NOT NULL,
        cliente_id INTEGER NOT NULL REFERENCES clientes(id),
        produto_id INTEGER NOT NULL REFERENCES produtos(id),
        quantidade INTEGER NOT NULL,
        tamanho VARCHAR(5),
        cor VARCHAR(30),
        preco_unitario DECIMAL(10,2) NOT NULL,
        preco_total DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) DEFAULT 0,
        forma_pagamento VARCHAR(50),
        endereco_entrega TEXT,
        observacoes TEXT,
        status VARCHAR(20) DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabelas recriadas com sucesso!');
    res.json({
      success: true,
      message: 'Tabelas recriadas com sucesso!',
      tabelas: ['usuarios', 'clientes', 'fornecedores', 'produtos', 'vendas'],
      esquema: 'SIMPLIFICADO'
    });
  } catch (error) {
    console.error('❌ Erro ao recriar tabelas:', error);
  res.status(500).json({
      success: false,
      message: 'Erro ao recriar tabelas',
      error: error.message
  });
  }
});

// Rota catch-all para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const startServer = async () => {
  try {
    console.log('🔄 Iniciando servidor...');
    
    // Testar conexão com banco de dados
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Interface Web: http://localhost:${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️ Criar tabelas: http://localhost:${PORT}/create-tables`);
      console.log(`🔄 Recriar tabelas: http://localhost:${PORT}/recreate-tables`);
      console.log(`📊 Verificar tabelas: http://localhost:${PORT}/check-tables`);
      console.log(`👤 Criar admin: POST http://localhost:${PORT}/create-admin`);
      console.log('\n🔐 SISTEMA DE AUTENTICAÇÃO IMPLEMENTADO!');
      console.log('📋 Tipos de usuário:');
      console.log('   • ADM: Pode criar, editar e excluir dados');
      console.log('   • USUARIO: Pode apenas visualizar dados');
      console.log('✅ Servidor pronto para uso!');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer(); 