const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// ============================================
// SERVIÇO DE ADMIN - USA SERVICE ROLE KEY
// ============================================

class AdminService {
  constructor() {
    // Service Role Key - APENAS NO SERVIDOR
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas');
    }

    // Cliente com privilégios de admin
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    logger.info('✅ Service de Admin inicializado');
  }

  // ============================================
  // 1. CONVIDAR NOVO USUÁRIO
  // ============================================
  async inviteUser(email, options = {}) {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      logger.info(`🔔 Convidando usuário: ${normalizedEmail}`);

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Email inválido');
      }

      const redirectTo = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/set-password`
        : undefined;

      // 1. Convidar via Supabase (envia link para definir senha)
      const { data, error: authError } = await this.supabase.auth.admin.inviteUserByEmail(
        normalizedEmail,
        redirectTo ? { redirectTo } : undefined
      );

      if (authError) {
        logger.error('Erro ao convidar usuário no auth', {
          message: authError.message,
          status: authError.status,
          code: authError.code,
          details: authError.details,
          hint: authError.hint
        });
        throw authError;
      }

      const invitedUser = data?.user;
      if (invitedUser?.id) {
        // 2. Garantir role default na tabela user_roles
        const { error: roleError } = await this.supabase
          .from('user_roles')
          .upsert([{
            user_id: invitedUser.id,
            role: 'user'
          }], { onConflict: 'user_id' });

        if (roleError) {
          logger.warn(`⚠️ Erro ao criar role para ${normalizedEmail}:`, roleError.message);
        }
      } else {
        logger.warn('⚠️ Convite criado sem user id retornado');
      }

      return {
        success: true,
        userId: invitedUser?.id || null,
        email: invitedUser?.email || normalizedEmail,
        message: `Convite enviado para ${normalizedEmail}`
      };
    } catch (error) {
      logger.error('❌ Erro ao convidar usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 2. LISTAR TODOS OS USUÁRIOS
  // ============================================
  async listUsers() {
    try {
      logger.info('📋 Listando todos os usuários');

      // Buscar todos os usuários do auth
      const { data, error } = await this.supabase.auth.admin.listUsers();

      if (error) {
        logger.error('Erro ao listar usuários', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      const users = data?.users || [];

      // Enriquecer com dados de roles
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const { data: roleData } = await this.supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            role: roleData?.role || 'user',
            is_active: !user.banned_until || new Date(user.banned_until) < new Date()
          };
        })
      );

      logger.info(`✅ ${usersWithRoles.length} usuários encontrados`);
      return usersWithRoles;
    } catch (error) {
      logger.error('❌ Erro ao listar usuários', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 3. DESATIVAR USUÁRIO
  // ============================================
  async disableUser(userId) {
    try {
      logger.info(`🔒 Desativando usuário: ${userId}`);

      // Banir o usuário (impede login)
      const { data, error } = await this.supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '876000h' } // Ban por ~100 anos
      );

      if (error) {
        logger.error('Erro ao desativar usuário', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      logger.info(`✅ Usuário ${userId} desativado`);

      return {
        success: true,
        userId,
        message: 'Usuário desativado com sucesso'
      };
    } catch (error) {
      logger.error('❌ Erro ao desativar usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 4. REATIVAR USUÁRIO
  // ============================================
  async enableUser(userId) {
    try {
      logger.info(`🔓 Reativando usuário: ${userId}`);

      // Remover ban
      const { data, error } = await this.supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '0s' }
      );

      if (error) {
        logger.error('Erro ao reativar usuário', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      logger.info(`✅ Usuário ${userId} reativado`);

      return {
        success: true,
        userId,
        message: 'Usuário reativado com sucesso'
      };
    } catch (error) {
      logger.error('❌ Erro ao reativar usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 5. PROMOVER PARA ADMIN
  // ============================================
  async promoteToAdmin(userId) {
    try {
      logger.info(`👑 Promovendo usuário para admin: ${userId}`);

      // Atualizar role na tabela
      const { error } = await this.supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao promover usuário', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      logger.info(`✅ Usuário ${userId} promovido a admin`);

      return {
        success: true,
        userId,
        role: 'admin',
        message: 'Usuário promovido a admin com sucesso'
      };
    } catch (error) {
      logger.error('❌ Erro ao promover usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 6. REMOVER ADMIN
  // ============================================
  async demoteFromAdmin(userId) {
    try {
      logger.info(`📊 Degradando usuário de admin: ${userId}`);

      // Atualizar role na tabela
      const { error } = await this.supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao degradar usuário', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      logger.info(`✅ Usuário ${userId} degradado a user`);

      return {
        success: true,
        userId,
        role: 'user',
        message: 'Usuário degradado com sucesso'
      };
    } catch (error) {
      logger.error('❌ Erro ao degradar usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // 7. OBTER ROLE DO USUÁRIO
  // ============================================
  async getUserRole(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.role || 'user';
    } catch (error) {
      logger.error('Erro ao obter role do usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      return 'user'; // Default
    }
  }

  // ============================================
  // 8. DELETAR USUÁRIO
  // ============================================
  async deleteUser(userId) {
    try {
      logger.info(`🗑️ Deletando usuário: ${userId}`);

      const { error } = await this.supabase.auth.admin.deleteUser(userId);

      if (error) {
        logger.error('Erro ao deletar usuário', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      logger.info(`✅ Usuário ${userId} deletado`);

      return {
        success: true,
        userId,
        message: 'Usuário deletado com sucesso'
      };
    } catch (error) {
      logger.error('❌ Erro ao deletar usuário', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      throw error;
    }
  }

  // ============================================
  // HELPER: Gerar senha aleatória
  // ============================================
  generateRandomPassword() {
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

module.exports = new AdminService();
