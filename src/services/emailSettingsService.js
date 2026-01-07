import { supabase } from '../lib/supabaseClient';

export const emailSettingsService = {
  async getSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

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
      return { data: null, error: error.message };
    }
  },

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
      return { data: null, error: error.message };
    }
  },

  async getClientException(clienteId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('email_exceptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('cliente_id', clienteId)
        .single();

      if (error && error.code === 'PGRST116') {
        return { data: null, error: null };
      }

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  async setClientException(clienteId, exceptions) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('email_exceptions')
        .upsert(
          {
            user_id: user.id,
            cliente_id: clienteId,
            ...exceptions
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
      return { data: null, error: error.message };
    }
  }
};