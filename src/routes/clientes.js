const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { verificarToken, verificarAdmin, verificarUsuario } = require('../middleware/auth');

// GET - Listar todos os clientes (ADM e USUARIO podem ver)
router.get('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const [clientes] = await sequelize.query(`
      SELECT * FROM clientes WHERE ativo = true ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Clientes listados com sucesso',
      data: clientes,
      total: clientes.length,
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar clientes',
      error: error.message
    });
  }
});

// GET - Buscar cliente por ID (ADM e USUARIO podem ver)
router.get('/:id', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const [clientes] = await sequelize.query(`
      SELECT * FROM clientes WHERE id = :id AND ativo = true
    `, {
      replacements: { id }
    });
    
    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente encontrado',
      data: clientes[0],
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente',
      error: error.message
    });
  }
});

// POST - Criar novo cliente (APENAS ADM)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nome, email, telefone, endereco, cidade, estado, cep } = req.body;
    
    // Validações básicas - apenas nome obrigatório
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
        campos_obrigatorios: ['nome']
      });
    }
    
    const [result] = await sequelize.query(`
      INSERT INTO clientes (nome, email, telefone, endereco, cidade, estado, cep)
      VALUES (:nome, :email, :telefone, :endereco, :cidade, :estado, :cep)
      RETURNING *
    `, {
      replacements: { nome, email, telefone, endereco, cidade, estado, cep }
    });
    
    res.status(201).json({
      success: true,
      message: 'Cliente cadastrado com sucesso',
      data: result[0],
      criado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    if (error.original && error.original.constraint) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
        error: 'Dados duplicados'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar cliente',
      error: error.message
    });
  }
});

// PUT - Atualizar cliente (APENAS ADM)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, endereco, cidade, estado, cep } = req.body;
    
    const [result] = await sequelize.query(`
      UPDATE clientes 
      SET nome = :nome, email = :email, telefone = :telefone, 
          endereco = :endereco, cidade = :cidade, estado = :estado, 
          cep = :cep, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { id, nome, email, telefone, endereco, cidade, estado, cep }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: result[0],
      atualizado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente',
      error: error.message
    });
  }
});

// DELETE - Excluir cliente (APENAS ADM)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await sequelize.query(`
      UPDATE clientes 
      SET ativo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { id }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso',
      excluido_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir cliente',
      error: error.message
    });
  }
});

module.exports = router; 