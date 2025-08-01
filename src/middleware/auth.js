const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

// Chave secreta para JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte_aqui';

// Cache simples para usuários (em produção, use Redis)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token || 
                  req.body.token || 
                  req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar cache primeiro
    const cacheKey = `user_${decoded.id}`;
    const cachedUser = userCache.get(cacheKey);
    
    if (cachedUser && (Date.now() - cachedUser.timestamp) < CACHE_TTL) {
      req.usuario = cachedUser.user;
      return next();
    }
    
    // Buscar usuário no banco apenas se não estiver em cache
    const [usuarios] = await sequelize.query(`
      SELECT id, nome, email, tipo, ativo, ultimo_login 
      FROM usuarios 
      WHERE id = :id AND ativo = true
    `, {
      replacements: { id: decoded.id }
    });

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = usuarios[0];
    
    // Armazenar no cache
    userCache.set(cacheKey, {
      user,
      timestamp: Date.now()
    });
    
    req.usuario = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Middleware para verificar se o usuário é ADM
const verificarAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.usuario.tipo !== 'ADM') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// Middleware para verificar se é admin OU usuario padrão (para leitura)
const verificarUsuario = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Tanto ADM quanto USUARIO podem acessar (para operações de leitura)
  if (req.usuario.tipo === 'ADM' || req.usuario.tipo === 'USUARIO') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado',
      code: 'ACCESS_DENIED'
    });
  }
};

// Função para gerar hash da senha
const hashSenha = async (senha) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(senha, salt);
};

// Função para comparar senha
const compararSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

// Função para gerar token JWT
const gerarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      tipo: usuario.tipo 
    },
    JWT_SECRET,
    { 
      expiresIn: '24h' // Token expira em 24 horas
    }
  );
};

// Função para limpar cache de usuário
const limparCacheUsuario = (userId) => {
  const cacheKey = `user_${userId}`;
  userCache.delete(cacheKey);
};

// Função para limpar todo o cache
const limparCache = () => {
  userCache.clear();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarUsuario,
  hashSenha,
  compararSenha,
  gerarToken,
  limparCacheUsuario,
  limparCache,
  JWT_SECRET
}; 