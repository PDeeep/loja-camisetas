const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { verificarToken, verificarAdmin, verificarUsuario } = require('../middleware/auth');

// GET - Listar todos os produtos (ADM e USUARIO podem ver)
router.get('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const [produtos] = await sequelize.query(`
      SELECT p.*, f.nome as fornecedor_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = true 
      ORDER BY p.created_at DESC
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
      SELECT p.*, f.nome as fornecedor_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.id = :id AND p.ativo = true
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
      nome, descricao, preco, preco_promocional, estoque, categoria,
      tamanhos_disponiveis, cores_disponiveis, material, peso,
      personalizavel, imagem_url, fornecedor_id
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
        nome, descricao, preco, preco_promocional, estoque, categoria,
        tamanhos_disponiveis, cores_disponiveis, material, peso,
        personalizavel, imagem_url, fornecedor_id
      )
      VALUES (
        :nome, :descricao, :preco, :preco_promocional, :estoque, :categoria,
        :tamanhos_disponiveis, :cores_disponiveis, :material, :peso,
        :personalizavel, :imagem_url, :fornecedor_id
      )
      RETURNING *
    `, {
      replacements: { 
        nome, descricao, preco, preco_promocional, estoque, categoria,
        tamanhos_disponiveis, cores_disponiveis, material, peso,
        personalizavel: personalizavel || false, imagem_url, fornecedor_id
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
      nome, descricao, preco, preco_promocional, estoque, categoria,
      tamanhos_disponiveis, cores_disponiveis, material, peso,
      personalizavel, imagem_url, fornecedor_id
    } = req.body;
    
    const [result] = await sequelize.query(`
      UPDATE produtos 
      SET nome = :nome, descricao = :descricao, preco = :preco,
          preco_promocional = :preco_promocional, estoque = :estoque,
          categoria = :categoria, tamanhos_disponiveis = :tamanhos_disponiveis,
          cores_disponiveis = :cores_disponiveis, material = :material,
          peso = :peso, personalizavel = :personalizavel, imagem_url = :imagem_url,
          fornecedor_id = :fornecedor_id, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { 
        id, nome, descricao, preco, preco_promocional, estoque, categoria,
        tamanhos_disponiveis, cores_disponiveis, material, peso,
        personalizavel, imagem_url, fornecedor_id
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