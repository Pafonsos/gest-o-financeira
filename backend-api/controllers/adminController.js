const adminService = require('../services/adminService');
const { logger } = require('../utils/logger');

// ============================================
// CONTROLADOR DE ADMIN
// ============================================

// Middleware: Verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Não autenticado',
        message: 'Token não fornecido' 
      });
    }

    const role = await adminService.getUserRole(userId);

    if (role !== 'admin') {
      logger.warn(`❌ Acesso negado para usuário não-admin: ${userId}`);
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso' 
      });
    }

    next();
  } catch (error) {
    logger.error('Erro no middleware de admin:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

// ============================================
// 1. CONVIDAR USUÁRIO
// ============================================
const inviteUser = async (req, res) => {
  try {
    const { email, userData } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Email inválido',
        message: 'Forneça um email válido' 
      });
    }

    const result = await adminService.inviteUser(email, { userData, invitedBy: req.user?.id });

    logger.info(`✅ Usuário convidado com sucesso: ${email}`);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Erro ao convidar usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao convidar usuário',
      message: error.message 
    });
  }
};

// ============================================
// 2. LISTAR USUÁRIOS
// ============================================
const listUsers = async (req, res) => {
  try {
    const users = await adminService.listUsers();

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error.message);
    res.status(500).json({ 
      error: 'Erro ao listar usuários',
      message: error.message 
    });
  }
};

// ============================================
// 3. DESATIVAR USUÁRIO
// ============================================
const disableUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID do usuário não fornecido' 
      });
    }

    // Validar que não está tentando desativar a si mesmo
    if (userId === req.user?.id) {
      return res.status(400).json({ 
        error: 'Você não pode desativar sua própria conta' 
      });
    }

    const result = await adminService.disableUser(userId);

    logger.info(`✅ Usuário desativado: ${userId}`);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao desativar usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao desativar usuário',
      message: error.message 
    });
  }
};

// ============================================
// 4. REATIVAR USUÁRIO
// ============================================
const enableUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID do usuário não fornecido' 
      });
    }

    const result = await adminService.enableUser(userId);

    logger.info(`✅ Usuário reativado: ${userId}`);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao reativar usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao reativar usuário',
      message: error.message 
    });
  }
};

// ============================================
// 5. PROMOVER PARA ADMIN
// ============================================
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID do usuário não fornecido' 
      });
    }

    const result = await adminService.promoteToAdmin(userId);

    logger.info(`✅ Usuário promovido a admin: ${userId}`);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao promover usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao promover usuário',
      message: error.message 
    });
  }
};

// ============================================
// 6. REMOVER ADMIN
// ============================================
const demoteFromAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID do usuário não fornecido' 
      });
    }

    // Validar que não está tentando remover admin de si mesmo
    if (userId === req.user?.id) {
      return res.status(400).json({ 
        error: 'Você não pode remover suas próprias permissões de admin' 
      });
    }

    const result = await adminService.demoteFromAdmin(userId);

    logger.info(`✅ Usuário degradado: ${userId}`);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao degradar usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao degradar usuário',
      message: error.message 
    });
  }
};

// ============================================
// 7. DELETAR USUÁRIO
// ============================================
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        error: 'ID do usuário não fornecido' 
      });
    }

    // Validar que não está tentando deletar a si mesmo
    if (userId === req.user?.id) {
      return res.status(400).json({ 
        error: 'Você não pode deletar sua própria conta' 
      });
    }

    const result = await adminService.deleteUser(userId);

    logger.info(`✅ Usuário deletado: ${userId}`);
    res.json(result);
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao deletar usuário',
      message: error.message 
    });
  }
};

// ============================================
// 8. OBTER ROLE DO USUÁRIO ATUAL
// ============================================
const getCurrentUserRole = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Não autenticado' 
      });
    }

    const role = await adminService.getUserRole(userId);

    res.json({
      success: true,
      userId,
      role,
      isAdmin: role === 'admin'
    });
  } catch (error) {
    logger.error('Erro ao obter role do usuário:', error.message);
    res.status(500).json({ 
      error: 'Erro ao obter role',
      message: error.message 
    });
  }
};

module.exports = {
  requireAdmin,
  inviteUser,
  listUsers,
  disableUser,
  enableUser,
  promoteToAdmin,
  demoteFromAdmin,
  deleteUser,
  getCurrentUserRole
};
