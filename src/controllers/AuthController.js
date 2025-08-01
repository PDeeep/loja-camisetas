const { sequelize } = require('../config/database');
const { hashSenha, compararSenha, gerarToken } = require('../middleware/auth');

class AuthController {
  // Registro de novo usuário
  static async registrar(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios'
        });
      }

      // Verificar se email já existe
      const [usuarioExistente] = await sequelize.query(`
        SELECT id FROM usuarios WHERE email = :email
      `, {
        replacements: { email }
      });

      if (usuarioExistente.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Hash da senha
      const senhaHash = await hashSenha(senha);

      // Inserir usuário
      const [resultado] = await sequelize.query(`
        INSERT INTO usuarios (nome, email, senha, tipo)
        VALUES (:nome, :email, :senha, :tipo)
        RETURNING id, nome, email, tipo, created_at
      `, {
        replacements: { 
          nome, 
          email, 
          senha: senhaHash, 
          tipo: tipo || 'USUARIO' 
        }
      });

      const novoUsuario = resultado[0];

      // Gerar token
      const token = gerarToken(novoUsuario);

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          usuario: {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipo: novoUsuario.tipo
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const [usuarios] = await sequelize.query(`
        SELECT id, nome, email, senha, tipo, ativo 
        FROM usuarios 
        WHERE email = :email
      `, {
        replacements: { email }
      });

      if (usuarios.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }

      const usuario = usuarios[0];

      // Verificar se usuário está ativo
      if (!usuario.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Usuário inativo. Entre em contato com o administrador.'
        });
      }

      // Verificar senha
      const senhaValida = await compararSenha(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }

      // Atualizar último login
      await sequelize.query(`
        UPDATE usuarios 
        SET ultimo_login = CURRENT_TIMESTAMP 
        WHERE id = :id
      `, {
        replacements: { id: usuario.id }
      });

      // Gerar token
      const token = gerarToken(usuario);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Perfil do usuário (dados do usuário logado)
  static async perfil(req, res) {
    try {
      res.json({
        success: true,
        message: 'Dados do usuário',
        data: {
          usuario: req.usuario
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Listar usuários (apenas para ADM)
  static async listarUsuarios(req, res) {
    try {
      const [usuarios] = await sequelize.query(`
        SELECT id, nome, email, tipo, ativo, ultimo_login, created_at
        FROM usuarios 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        message: 'Usuários listados com sucesso',
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  }

  // Alternar status do usuário (ativar/desativar) - apenas para ADM
  static async alternarStatus(req, res) {
    try {
      const { id } = req.params;

      // Não permitir que o admin desative a si mesmo
      if (parseInt(id) === req.usuario.id) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode desativar sua própria conta'
        });
      }

      const [resultado] = await sequelize.query(`
        UPDATE usuarios 
        SET ativo = NOT ativo, updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
        RETURNING id, nome, email, tipo, ativo
      `, {
        replacements: { id }
      });

      if (resultado.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const usuario = resultado[0];
      const status = usuario.ativo ? 'ativado' : 'desativado';

      res.json({
        success: true,
        message: `Usuário ${status} com sucesso`,
        data: usuario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do usuário',
        error: error.message
      });
    }
  }
}

module.exports = AuthController; 