const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { verificarToken, verificarAdmin, verificarUsuario } = require('../middleware/auth');

// GET - Listar todos os fornecedores (ADM e USUARIO podem ver)
router.get('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const [fornecedores] = await sequelize.query(`
      SELECT * FROM fornecedores WHERE ativo = true ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Fornecedores listados com sucesso',
      data: fornecedores,
      total: fornecedores.length,
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar fornecedores',
      error: error.message
    });
  }
});

// GET - Buscar fornecedor por ID (ADM e USUARIO podem ver)
router.get('/:id', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const [fornecedores] = await sequelize.query(`
      SELECT * FROM fornecedores WHERE id = :id AND ativo = true
    `, {
      replacements: { id }
    });
    
    if (fornecedores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Fornecedor encontrado',
      data: fornecedores[0],
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar fornecedor',
      error: error.message
    });
  }
});

// POST - Criar novo fornecedor (APENAS ADM)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { 
      nome, razao_social, cnpj, email, telefone, endereco, 
      cidade, estado, cep, tipo_fornecimento, prazo_entrega 
    } = req.body;
    
    // Validações básicas - apenas nome obrigatório
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório',
        campos_obrigatorios: ['nome']
      });
    }
    
    const [result] = await sequelize.query(`
      INSERT INTO fornecedores (
        nome, razao_social, cnpj, email, telefone, endereco,
        cidade, estado, cep, tipo_fornecimento, prazo_entrega
      )
      VALUES (
        :nome, :razao_social, :cnpj, :email, :telefone, :endereco,
        :cidade, :estado, :cep, :tipo_fornecimento, :prazo_entrega
      )
      RETURNING *
    `, {
      replacements: { 
        nome, razao_social, cnpj, email, telefone, endereco,
        cidade, estado, cep, tipo_fornecimento, prazo_entrega
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Fornecedor cadastrado com sucesso',
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
        message: 'CNPJ já cadastrado',
        error: 'CNPJ duplicado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar fornecedor',
      error: error.message
    });
  }
});

// PUT - Atualizar fornecedor (APENAS ADM)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nome, razao_social, email, telefone, endereco,
      cidade, estado, cep, tipo_fornecimento, prazo_entrega
    } = req.body;
    
    const [result] = await sequelize.query(`
      UPDATE fornecedores 
      SET nome = :nome, razao_social = :razao_social, email = :email,
          telefone = :telefone, endereco = :endereco, cidade = :cidade,
          estado = :estado, cep = :cep, tipo_fornecimento = :tipo_fornecimento,
          prazo_entrega = :prazo_entrega, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { 
        id, nome, razao_social, email, telefone, endereco,
        cidade, estado, cep, tipo_fornecimento, prazo_entrega
      }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Fornecedor atualizado com sucesso',
      data: result[0],
      atualizado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar fornecedor',
      error: error.message
    });
  }
});

// DELETE - Excluir fornecedor (APENAS ADM)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await sequelize.query(`
      UPDATE fornecedores 
      SET ativo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND ativo = true
      RETURNING *
    `, {
      replacements: { id }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Fornecedor excluído com sucesso',
      excluido_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir fornecedor',
      error: error.message
    });
  }
});

module.exports = router; 