const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { verificarToken, verificarAdmin, verificarUsuario } = require('../middleware/auth');

// GET - Listar todos os produtos (ADM e USUARIO podem ver)
router.get('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const [produtos] = await sequelize.query(`
      SELECT * FROM produtos WHERE ativo = true ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Produtos listados com sucesso',
      data: produtos,
      total: produtos.length,
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      error: error.message
    });
  }
});

// GET - Buscar produto por ID (ADM e USUARIO podem ver)
router.get('/:id', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const [produtos] = await sequelize.query(`
      SELECT * FROM produtos WHERE id = :id AND ativo = true
    `, {
      replacements: { id }
    });
    
    if (produtos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Produto encontrado',
      data: produtos[0],
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
      error: error.message
    });
  }
});

// POST - Criar novo produto (APENAS ADM)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { 
      nome, descricao, preco, estoque, categoria
    } = req.body;
    
    // Validações básicas
    if (!nome || !descricao || !preco || estoque === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, descricao, preco, estoque',
        campos_obrigatorios: ['nome', 'descricao', 'preco', 'estoque']
      });
    }
    
    const [result] = await sequelize.query(`
      INSERT INTO produtos (
        nome, descricao, preco, estoque, categoria
      )
      VALUES (
        :nome, :descricao, :preco, :estoque, :categoria
      )
      RETURNING *
    `, {
      replacements: { 
        nome, descricao, preco, estoque, categoria
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso',
      data: result[0],
      criado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar produto',
      error: error.message
    });
  }
});

// PUT - Atualizar produto (APENAS ADM)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome, descricao, preco, estoque, categoria
    } = req.body;
    
    const [result] = await sequelize.query(`
      UPDATE produtos 
      SET nome = :nome, descricao = :descricao, preco = :preco,
          estoque = :estoque, categoria = :categoria, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { 
        id, nome, descricao, preco, estoque, categoria
      }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: result[0],
      atualizado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

// DELETE - Excluir produto (APENAS ADM)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await sequelize.query(`
      UPDATE produtos 
      SET ativo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { id }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
      excluido_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir produto',
      error: error.message
    });
  }
});

module.exports = router; 