const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============================================
// ROTAS DE ADMIN
// Todas requerem autenticação + role admin
// ============================================

// Middleware de autenticação em todas as rotas
router.use(verifyToken);

// ============================================
// ROTA PÚBLICA (apenas autenticado)
// ============================================

// GET /api/admin/me - Obter role do usuário atual
router.get('/me', adminController.getCurrentUserRole);

// ============================================
// ROTAS ADMIN (requerem role === 'admin')
// ============================================

// POST /api/admin/invite - Convidar novo usuário
router.post(
  '/invite',
  adminController.requireAdmin,
  adminController.inviteUser
);

// GET /api/admin/users - Listar todos os usuários
router.get(
  '/users',
  adminController.requireAdmin,
  adminController.listUsers
);

// PUT /api/admin/users/:userId/disable - Desativar usuário
router.put(
  '/users/:userId/disable',
  adminController.requireAdmin,
  adminController.disableUser
);

// PUT /api/admin/users/:userId/enable - Reativar usuário
router.put(
  '/users/:userId/enable',
  adminController.requireAdmin,
  adminController.enableUser
);

// PUT /api/admin/users/:userId/promote - Promover para admin
router.put(
  '/users/:userId/promote',
  adminController.requireAdmin,
  adminController.promoteToAdmin
);

// PUT /api/admin/users/:userId/demote - Remover admin
router.put(
  '/users/:userId/demote',
  adminController.requireAdmin,
  adminController.demoteFromAdmin
);

// DELETE /api/admin/users/:userId - Deletar usuário
router.delete(
  '/users/:userId',
  adminController.requireAdmin,
  adminController.deleteUser
);

module.exports = router;
