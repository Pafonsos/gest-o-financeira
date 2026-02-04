const express = require('express');
const router = express.Router();
const pipefyController = require('../controllers/pipefyController');
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas as rotas requerem autenticação e admin
router.use(verifyToken);
router.use(adminController.requireAdmin);

// POST /api/pipefy/test - Testar conexão com Pipefy
router.post('/test', pipefyController.testConnection);

// POST /api/pipefy/pipe-fields - Listar campos do Pipe
router.post('/pipe-fields', pipefyController.getPipeFields);

// POST /api/pipefy/push-clients - Enviar clientes para o Pipefy
router.post('/push-clients', pipefyController.pushClients);

// POST /api/pipefy/pull-cards - Buscar cards do Pipefy
router.post('/pull-cards', pipefyController.pullCards);

// POST /api/pipefy/move-card - Mover card para outra fase
router.post('/move-card', pipefyController.moveCard);

module.exports = router;
