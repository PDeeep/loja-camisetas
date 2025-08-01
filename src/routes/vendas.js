const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { verificarToken, verificarAdmin, verificarUsuario } = require('../middleware/auth');

// GET - Listar todas as vendas (ADM e USUARIO podem ver)
router.get('/', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const [vendas] = await sequelize.query(`
      SELECT v.*, c.nome as cliente_nome, p.nome as produto_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN produtos p ON v.produto_id = p.id
      ORDER BY v.created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Vendas listadas com sucesso',
      data: vendas,
      total: vendas.length,
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar vendas',
      error: error.message
    });
  }
});

// GET - Buscar venda por ID (ADM e USUARIO podem ver)
router.get('/:id', verificarToken, verificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const [vendas] = await sequelize.query(`
      SELECT v.*, c.nome as cliente_nome, p.nome as produto_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN produtos p ON v.produto_id = p.id
      WHERE v.id = :id
    `, {
      replacements: { id }
    });
    
    if (vendas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda encontrada',
      data: vendas[0],
      usuario_logado: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar venda',
      error: error.message
    });
  }
});

// POST - Criar nova venda (APENAS ADM)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { 
      cliente_id, produto_id, quantidade, tamanho, cor,
      preco_unitario, desconto, forma_pagamento, endereco_entrega, observacoes
    } = req.body;
    
    // Validações básicas
    if (!cliente_id || !produto_id || !quantidade || !preco_unitario) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios não preenchidos',
        campos_obrigatorios: ['cliente_id', 'produto_id', 'quantidade', 'preco_unitario']
      });
    }
    
    // Gerar número do pedido
    const numero_pedido = `PED${Date.now()}`;
    
    // Calcular preço total
    const preco_total = (preco_unitario * quantidade) - (desconto || 0);
    
    const [result] = await sequelize.query(`
      INSERT INTO vendas (
        numero_pedido, cliente_id, produto_id, quantidade, tamanho, cor,
        preco_unitario, preco_total, desconto, forma_pagamento, 
        endereco_entrega, observacoes
      )
      VALUES (
        :numero_pedido, :cliente_id, :produto_id, :quantidade, :tamanho, :cor,
        :preco_unitario, :preco_total, :desconto, :forma_pagamento,
        :endereco_entrega, :observacoes
      )
      RETURNING *
    `, {
      replacements: { 
        numero_pedido, cliente_id, produto_id, quantidade, tamanho, cor,
        preco_unitario, preco_total, desconto: desconto || 0, forma_pagamento,
        endereco_entrega, observacoes
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Venda cadastrada com sucesso',
      data: result[0],
      criado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar venda',
      error: error.message
    });
  }
});

// PUT - Atualizar venda (APENAS ADM)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      quantidade, tamanho, cor, preco_unitario, desconto,
      status, forma_pagamento, endereco_entrega, observacoes
    } = req.body;
    
    // Recalcular preço total se quantidade ou preço mudaram
    const preco_total = preco_unitario && quantidade ? 
      (preco_unitario * quantidade) - (desconto || 0) : undefined;
    
    let updateQuery = `
      UPDATE vendas 
      SET updated_at = CURRENT_TIMESTAMP
    `;
    let replacements = { id };
    
    // Adicionar campos dinamicamente
    if (quantidade !== undefined) {
      updateQuery += `, quantidade = :quantidade`;
      replacements.quantidade = quantidade;
    }
    if (tamanho) {
      updateQuery += `, tamanho = :tamanho`;
      replacements.tamanho = tamanho;
    }
    if (cor) {
      updateQuery += `, cor = :cor`;
      replacements.cor = cor;
    }
    if (preco_unitario !== undefined) {
      updateQuery += `, preco_unitario = :preco_unitario`;
      replacements.preco_unitario = preco_unitario;
    }
    if (preco_total !== undefined) {
      updateQuery += `, preco_total = :preco_total`;
      replacements.preco_total = preco_total;
    }
    if (desconto !== undefined) {
      updateQuery += `, desconto = :desconto`;
      replacements.desconto = desconto;
    }
    if (status) {
      updateQuery += `, status = :status`;
      replacements.status = status;
    }
    if (forma_pagamento) {
      updateQuery += `, forma_pagamento = :forma_pagamento`;
      replacements.forma_pagamento = forma_pagamento;
    }
    if (endereco_entrega) {
      updateQuery += `, endereco_entrega = :endereco_entrega`;
      replacements.endereco_entrega = endereco_entrega;
    }
    if (observacoes !== undefined) {
      updateQuery += `, observacoes = :observacoes`;
      replacements.observacoes = observacoes;
    }
    
    updateQuery += ` WHERE id = :id RETURNING *`;
    
    const [result] = await sequelize.query(updateQuery, { replacements });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda atualizada com sucesso',
      data: result[0],
      atualizado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar venda',
      error: error.message
    });
  }
});

// DELETE - Cancelar venda (APENAS ADM)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await sequelize.query(`
      UPDATE vendas 
      SET status = 'cancelado', updated_at = CURRENT_TIMESTAMP
      WHERE id = :id
      RETURNING *
    `, {
      replacements: { id }
    });
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda cancelada com sucesso',
      cancelado_por: {
        nome: req.usuario.nome,
        tipo: req.usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar venda',
      error: error.message
    });
  }
});

module.exports = router; 