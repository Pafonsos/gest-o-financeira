// ============================================
// SERVIÇO DE NOTIFICAÇÕES ATUALIZADO
// backand/services/notificationService.js
// ============================================

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// Configurar Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
    this.scheduleNotifications();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // ==================== AGENDAMENTO ====================
  
  scheduleNotifications() {
    // Verificar vencimentos próximos - todo dia às 9h
    cron.schedule('0 9 * * *', () => {
      logger.info('🔍 Verificando vencimentos próximos...');
      this.checkUpcomingDueDates();
    });

    // Verificar pagamentos atrasados - todo dia às 10h
    cron.schedule('0 10 * * *', () => {
      logger.info('🔍 Verificando pagamentos atrasados...');
      this.checkOverduePayments();
    });

    // Verificar relatórios semanais - a cada hora
    cron.schedule('0 * * * *', () => {
      this.checkWeeklyReports();
    });

    logger.info('✅ Sistema de notificações agendado com sucesso');
  }

  // ==================== VERIFICAÇÕES ====================

  // Verificar se pode enviar email
  async canSendEmail(userId, clienteId, tipoEmail) {
    try {
      // 1. Buscar configurações globais do usuário
      const { data: settings, error: settingsError } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError) {
        logger.warn(`⚠️ Configurações não encontradas para usuário ${userId}, usando padrão`);
        return true; // Se não tem config, permite por padrão
      }

      // 2. Verificar exceções do cliente
      const { data: exception } = await supabase
        .from('email_exceptions')
        .select('*')
        .eq('user_id', userId)
        .eq('cliente_id', clienteId)
        .single();

      // Se todos os emails estão desativados para este cliente
      if (exception?.todos_emails_desativados) {
        logger.info(`🚫 Todos emails desativados para cliente ${clienteId}`);
        return false;
      }

      // 3. Verificar cada tipo de email
      switch (tipoEmail) {
        case 'lembrete_vencimento':
          if (!settings.lembrete_vencimento_ativo) {
            logger.info(`🚫 Lembretes desativados globalmente`);
            return false;
          }
          if (exception?.lembrete_vencimento_desativado) {
            logger.info(`🚫 Lembrete desativado para cliente ${clienteId}`);
            return false;
          }
          return true;

        case 'cobranca_atraso':
          if (!settings.cobranca_atraso_ativo) {
            logger.info(`🚫 Cobranças desativadas globalmente`);
            return false;
          }
          if (exception?.cobranca_atraso_desativado) {
            logger.info(`🚫 Cobrança desativada para cliente ${clienteId}`);
            return false;
          }
          return true;

        case 'relatorio_semanal':
          if (!settings.relatorio_semanal_ativo) {
            logger.info(`🚫 Relatórios desativados globalmente`);
            return false;
          }
          if (exception?.relatorio_semanal_desativado) {
            logger.info(`🚫 Cliente ${clienteId} excluído do relatório`);
            return false;
          }
          return true;

        default:
          return true;
      }
    } catch (error) {
      logger.error('❌ Erro ao verificar permissão de email:', error);
      return true; // Fail-safe: em caso de erro, permite envio
    }
  }

  // Buscar dias de antecedência configurados
  async getDiasAntecedencia(userId) {
    try {
      const { data: settings } = await supabase
        .from('email_settings')
        .select('lembrete_dias_antecedencia')
        .eq('user_id', userId)
        .single();

      return settings?.lembrete_dias_antecedencia || 3;
    } catch (error) {
      return 3; // Padrão
    }
  }

  // ==================== VERIFICAR VENCIMENTOS ====================

  async checkUpcomingDueDates() {
    try {
      // Buscar todos os usuários com lembretes ativos
      const { data: activeUsers } = await supabase
        .from('email_settings')
        .select('user_id, lembrete_dias_antecedencia')
        .eq('lembrete_vencimento_ativo', true);

      if (!activeUsers || activeUsers.length === 0) {
        logger.info('ℹ️ Nenhum usuário com lembretes ativos');
        return;
      }

      let totalEnviados = 0;
      let totalBloqueados = 0;

      for (const user of activeUsers) {
        const diasAntecedencia = user.lembrete_dias_antecedencia || 3;
        const hoje = new Date();
        const dataLimite = new Date();
        dataLimite.setDate(hoje.getDate() + diasAntecedencia);

        // Buscar clientes com vencimento próximo
        const { data: clientes } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', user.user_id)
          .neq('status', 'pago')
          .gte('proximo_vencimento', hoje.toISOString().split('T')[0])
          .lte('proximo_vencimento', dataLimite.toISOString().split('T')[0]);

        if (!clientes || clientes.length === 0) continue;

        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, nome, empresa')
          .eq('id', user.user_id)
          .single();

        if (!profile?.email) continue;

        for (const cliente of clientes) {
          // Verificar se pode enviar
          const canSend = await this.canSendEmail(
            user.user_id,
            cliente.id,
            'lembrete_vencimento'
          );

          if (canSend) {
            await this.sendReminderEmail(cliente, profile, diasAntecedencia);
            await this.logNotification(user.user_id, 'lembrete_vencimento', cliente.id);
            totalEnviados++;
          } else {
            totalBloqueados++;
          }
        }
      }

      logger.info(`✅ Lembretes: ${totalEnviados} enviados, ${totalBloqueados} bloqueados`);
    } catch (error) {
      logger.error('❌ Erro ao verificar vencimentos:', error);
    }
  }

  // ==================== VERIFICAR ATRASOS ====================

  async checkOverduePayments() {
    try {
      const { data: activeUsers } = await supabase
        .from('email_settings')
        .select('user_id')
        .eq('cobranca_atraso_ativo', true);

      if (!activeUsers || activeUsers.length === 0) {
        logger.info('ℹ️ Nenhum usuário com cobranças ativas');
        return;
      }

      const hoje = new Date();
      let totalEnviados = 0;
      let totalBloqueados = 0;

      for (const user of activeUsers) {
        const { data: clientes } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', user.user_id)
          .lt('proximo_vencimento', hoje.toISOString().split('T')[0])
          .neq('status', 'pago');

        if (!clientes || clientes.length === 0) continue;

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, nome, empresa')
          .eq('id', user.user_id)
          .single();

        if (!profile?.email) continue;

        for (const cliente of clientes) {
          // Atualizar status para em_atraso
          await supabase
            .from('clientes')
            .update({ status: 'em_atraso' })
            .eq('id', cliente.id);

          const canSend = await this.canSendEmail(
            user.user_id,
            cliente.id,
            'cobranca_atraso'
          );

          if (canSend) {
            await this.sendOverdueEmail(cliente, profile);
            await this.logNotification(user.user_id, 'cobranca_atraso', cliente.id);
            totalEnviados++;
          } else {
            totalBloqueados++;
          }
        }
      }

      logger.info(`✅ Cobranças: ${totalEnviados} enviadas, ${totalBloqueados} bloqueadas`);
    } catch (error) {
      logger.error('❌ Erro ao verificar atrasos:', error);
    }
  }

  // ==================== VERIFICAR RELATÓRIOS ====================

  async checkWeeklyReports() {
    try {
      const agora = new Date();
      const diaAtual = agora.getDay();
      const horaAtual = agora.getHours();

      const { data: users } = await supabase
        .from('email_settings')
        .select('user_id, horario_envio')
        .eq('relatorio_semanal_ativo', true)
        .eq('relatorio_dia_semana', diaAtual);

      if (!users || users.length === 0) return;

      for (const user of users) {
        const [hora] = user.horario_envio.split(':');
        if (parseInt(hora) === horaAtual) {
          await this.sendWeeklyReport(user.user_id);
        }
      }
    } catch (error) {
      logger.error('❌ Erro ao verificar relatórios:', error);
    }
  }

  // ==================== ENVIAR EMAILS ====================

  async sendReminderEmail(cliente, profile, diasRestantes) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: profile.email,
      subject: `⏰ Lembrete: ${cliente.nome_empresa} vence em ${diasRestantes} dias`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">🔔 Lembrete de Vencimento</h2>
          <p>Olá <strong>${profile.nome}</strong>,</p>
          <p>Este é um lembrete sobre o vencimento próximo do cliente:</p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Cliente:</strong> ${cliente.nome_empresa}</p>
            <p><strong>Responsável:</strong> ${cliente.nome_responsavel}</p>
            <p><strong>Valor Pendente:</strong> R$ ${(cliente.valor_total - cliente.valor_pago).toFixed(2).replace('.', ',')}</p>
            <p><strong>Vencimento:</strong> ${new Date(cliente.proximo_vencimento).toLocaleDateString('pt-BR')}</p>
            <p style="color: #f59e0b; font-weight: bold;">
              ⚠️ Faltam ${diasRestantes} dias
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Notificação automática do Financial Manager<br>
            Para gerenciar preferências: Configurações → Config. Emails
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendOverdueEmail(cliente, profile) {
    const diasAtraso = Math.ceil(
      (new Date() - new Date(cliente.proximo_vencimento)) / (1000 * 60 * 60 * 24)
    );

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: profile.email,
      subject: `🚨 URGENTE: ${cliente.nome_empresa} - ${diasAtraso} dias em atraso`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">🚨 Pagamento em Atraso</h2>
          <p>Olá <strong>${profile.nome}</strong>,</p>
          <p>Identificamos pagamento em atraso:</p>
          
          <div style="background: #fee; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p><strong>Cliente:</strong> ${cliente.nome_empresa}</p>
            <p><strong>Responsável:</strong> ${cliente.nome_responsavel}</p>
            <p><strong>Valor Pendente:</strong> R$ ${(cliente.valor_total - cliente.valor_pago).toFixed(2).replace('.', ',')}</p>
            <p><strong>Vencimento:</strong> ${new Date(cliente.proximo_vencimento).toLocaleDateString('pt-BR')}</p>
            <p style="color: #ef4444; font-weight: bold;">
              ⚠️ ${diasAtraso} dias em atraso
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Notificação automática do Financial Manager<br>
            Para gerenciar preferências: Configurações → Config. Emails
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendWeeklyReport(userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Buscar clientes (excluir os com exceção)
      const { data: allClientes } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', userId);

      const { data: exceptions } = await supabase
        .from('email_exceptions')
        .select('cliente_id')
        .eq('user_id', userId)
        .eq('relatorio_semanal_desativado', true);

      const excludedIds = exceptions?.map(e => e.cliente_id) || [];
      const clientes = allClientes?.filter(c => !excludedIds.includes(c.id)) || [];

      const stats = {
        totalClientes: clientes.length,
        totalRecebido: clientes.reduce((sum, c) => sum + parseFloat(c.valor_pago || 0), 0),
        totalAReceber: clientes.reduce((sum, c) => sum + (parseFloat(c.valor_total) - parseFloat(c.valor_pago || 0)), 0),
        emAtraso: clientes.filter(c => c.status === 'em_atraso').length
      };

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: profile.email,
        subject: `📊 Relatório Semanal - ${profile.empresa}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">📊 Relatório Semanal</h2>
            <p>Olá <strong>${profile.nome}</strong>,</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Total de Clientes:</strong> ${stats.totalClientes}</p>
              <p><strong>Total Recebido:</strong> R$ ${stats.totalRecebido.toFixed(2).replace('.', ',')}</p>
              <p><strong>A Receber:</strong> R$ ${stats.totalAReceber.toFixed(2).replace('.', ',')}</p>
              ${stats.emAtraso > 0 ? `<p style="color: #ef4444;"><strong>⚠️ Em Atraso:</strong> ${stats.emAtraso} cliente(s)</p>` : ''}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Relatório automático do Financial Manager<br>
              Para alterar dia/horário: Configurações → Config. Emails
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Relatório semanal enviado para ${profile.email}`);
    } catch (error) {
      logger.error('❌ Erro ao enviar relatório semanal:', error);
    }
  }

  // ==================== LOG ====================

  async logNotification(userId, tipo, clienteId = null) {
    try {
      await supabase.from('notification_logs').insert([
        {
          user_id: userId,
          cliente_id: clienteId,
          tipo,
          enviado_em: new Date().toISOString()
        }
      ]);
    } catch (error) {
      logger.error('❌ Erro ao registrar notificação:', error);
    }
  }
}

module.exports = new NotificationService();