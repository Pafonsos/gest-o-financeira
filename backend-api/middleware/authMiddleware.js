const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// ============================================
// MIDDLEWARE: VERIFICAR TOKEN JWT
// ============================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const verifyToken = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido',
        message: 'Adicione o token no header Authorization'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar o token com o Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('❌ Token inválido ou expirado');
      return res.status(401).json({
        error: 'Token inválido ou expirado',
        message: error?.message || 'Faça login novamente'
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: data.user.id,
      email: data.user.email
    };

    logger.info(`✅ Token verificado para: ${data.user.email}`);
    next();
  } catch (error) {
    logger.error('Erro ao verificar token:', error.message);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

module.exports = {
  verifyToken
};
