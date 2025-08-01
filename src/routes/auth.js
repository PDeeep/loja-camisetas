const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Rotas públicas (não precisam de autenticação)
router.post('/registrar', AuthController.registrar);
router.post('/login', AuthController.login);

// Rotas protegidas (precisam de autenticação)
router.get('/perfil', verificarToken, AuthController.perfil);

// Rotas administrativas (só ADM pode acessar)
router.get('/usuarios', verificarToken, verificarAdmin, AuthController.listarUsuarios);
router.patch('/usuarios/:id/status', verificarToken, verificarAdmin, AuthController.alternarStatus);

module.exports = router; 