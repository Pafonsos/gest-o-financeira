// ============================================
// SERVIÇO COMPLETO DE CONFIGURAÇÕES DE EMAIL
// src/services/emailSettingsService.js
// ============================================

import { supabase } from '../lib/supabaseClient';

export const emailSettingsService = {
  // ==================== CONFIGURAÇÕES GLOBAIS ====================
  
  // Buscar configurações do usuário
  async getSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Ajuste: Verificação de usuário para evitar erro de leitura de null
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      let { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Se não existir, criar configurações padrão
      if (error && error.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from('email_settings')
          .insert([
            {
              user_id: user.id,
              lembrete_vencimento_ativo: true,
              lembrete_dias_antecedencia: 3,
              cobranca_atraso_ativo: true,
              relatorio_semanal_ativo: true,
              relatorio_dia_semana: 1,
              horario_envio: '09:00:00'
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        return { data: newSettings, error: null };
      }

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return { data: null, error: error.message };
    }
  },

  // Atualizar configurações
  async updateSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('email_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return { data: null, error: error.message };
    }
  },

  // ==================== EXCEÇÕES POR CLIENTE ====================

  // Buscar exceção de um cliente específico
  async getClientException(clienteId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: null };

      const { data, error } = await supabase
        .from('email_exceptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('cliente_id', clienteId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Não existe exceção para este cliente
        return { data: null, error: null };
      }

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar exceção do cliente:', error);
      return { data: null, error: error.message };
    }
  },

  // Criar ou atualizar exceção de cliente
  async setClientException(clienteId, exceptions) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('email_exceptions')
        .upsert(
          {
            user_id: user.id,
            cliente_id: clienteId,
            ...exceptions,
            created_at: new Date().toISOString()
          },
          {
            onConflict: 'user_id,cliente_id'
          }
        )
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao salvar exceção:', error);
      return { data: null, error: error.message };
    }
  },

  // Remover exceção de cliente
  async removeClientException(clienteId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('email_exceptions')
        .delete()
        .eq('user_id', user.id)
        .eq('cliente_id', clienteId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao remover exceção:', error);
      return { error: error.message };
    }
  },

  // Listar todas as exceções do usuário
  async getAllExceptions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('email_exceptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro ao listar exceções:', error);
      return { data: [], error: error.message };
    }
  },

  // ==================== VERIFICAÇÕES ====================

  // Verificar se pode enviar email para cliente
  async canSendEmailToClient(clienteId, tipoEmail) {
    try {
      // 1. Buscar configurações globais
      const { data: settings } = await this.getSettings();
      
      if (!settings) {
        // Se não tem configurações, permite por padrão
        return { canSend: true, reason: null };
      }

      // 2. Verificar exceções do cliente
      const { data: exception } = await this.getClientException(clienteId);

      // Se todos os emails est desativados para este cliente
      if (exception?.todos_emails_desativados) {
        return { 
          canSend: false, 
          reason: `Todos os emails desativados para este cliente${exception.motivo ? ': ' + exception.motivo : ''}` 
        };
      }

      // 3. Verificar cada tipo de email (Ajuste: Mapeamento de templates para os cases)
      let tipoNormalizado = tipoEmail;
      if (tipoEmail.includes('cobranca') || tipoEmail.includes('atraso')) tipoNormalizado = 'cobranca_atraso';
      if (tipoEmail.includes('vencimento')) tipoNormalizado = 'lembrete_vencimento';

      switch (tipoNormalizado) {
        case 'lembrete_vencimento':
          if (!settings.lembrete_vencimento_ativo) {
            return { canSend: false, reason: 'Lembretes de vencimento desativados globalmente' };
          }
          if (exception?.lembrete_vencimento_desativado) {
            return { canSend: false, reason: 'Lembrete desativado para este cliente' };
          }
          break;

        case 'cobranca_atraso':
          if (!settings.cobranca_atraso_ativo) {
            return { canSend: false, reason: 'Cobranças de atraso desativadas globalmente' };
          }
          if (exception?.cobranca_atraso_desativado) {
            return { canSend: false, reason: 'Cobrança desativada para este cliente' };
          }
          break;

        case 'relatorio_semanal':
          if (!settings.relatorio_semanal_ativo) {
            return { canSend: false, reason: 'Relatórios semanais desativados globalmente' };
          }
          if (exception?.relatorio_semanal_desativado) {
            return { canSend: false, reason: 'Cliente excluído do relatório semanal' };
          }
          break;

        default:
          return { canSend: true, reason: null };
      }

      return { canSend: true, reason: null };
    } catch (error) {
      console.error('Erro ao verificar permissão de email:', error);
      // Em caso de erro, permitir envio (fail-safe)
      return { canSend: true, reason: null };
    }
  },

  // ==================== ESTATÍSTICAS ====================

  // Buscar estatísticas de configurações
  async getStatistics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: 'Usuário não autenticado' };

      // Buscar configurações
      const { data: settings } = await this.getSettings();

      // Buscar exceções
      const { data: exceptions } = await this.getAllExceptions();

      return {
        data: {
          settings: settings || null,
          totalExceptions: exceptions ? exceptions.length : 0,
          exceptions: exceptions || []
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { data: null, error: error.message };
    }
  }
};

export default emailSettingsService;










