// ============================================
// COMPONENTE DE CONFIGURAÇÕES POR CLIENTE
// src/components/ClientEmailSettings.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { emailSettingsService } from '../services/emailSettingsService';

export const ClientEmailSettings = ({ cliente }) => {
  const [exceptions, setExceptions] = useState({
    lembrete_vencimento_desativado: false,
    cobranca_atraso_desativado: false,
    relatorio_semanal_desativado: false,
    todos_emails_desativados: false,
    motivo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (cliente?.id) {
      loadExceptions();
    }
  }, [cliente?.id]);

  const loadExceptions = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const { data, error } = await emailSettingsService.getClientException(cliente.id);
    
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } else if (data) {
      setExceptions(data);
    }
    
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setExceptions({ ...exceptions, [field]: value });
    setHasChanges(true);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Se todas as opções estão desativadas, remover o registro
    const todasDesativadas = 
      !exceptions.todos_emails_desativados &&
      !exceptions.lembrete_vencimento_desativado &&
      !exceptions.cobranca_atraso_desativado &&
      !exceptions.relatorio_semanal_desativado;

    let result;
    if (todasDesativadas) {
      result = await emailSettingsService.removeClientException(cliente.id);
    } else {
      result = await emailSettingsService.setClientException(cliente.id, exceptions);
    }

    if (result.error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } else {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setHasChanges(false);
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Configurações de Email deste Cliente</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Configurações de Email deste Cliente</h3>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Desativar Todos */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exceptions.todos_emails_desativados}
              onChange={(e) => handleChange('todos_emails_desativados', e.target.checked)}
              className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <div className="flex-1">
              <span className="font-medium text-red-900 block">
                Desativar TODOS os emails automáticos
              </span>
              <p className="text-sm text-red-700 mt-1">
                Este cliente não receberá nenhum email automático do sistema
              </p>
            </div>
          </label>
        </div>

        {/* Exceções individuais */}
        {!exceptions.todos_emails_desativados && (
          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={exceptions.lembrete_vencimento_desativado}
                onChange={(e) => handleChange('lembrete_vencimento_desativado', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 block">
                  Desativar lembretes de vencimento
                </span>
                <p className="text-sm text-gray-600">
                  Não enviar aviso antes do vencimento
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={exceptions.cobranca_atraso_desativado}
                onChange={(e) => handleChange('cobranca_atraso_desativado', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 block">
                  Desativar cobranças de atraso
                </span>
                <p className="text-sm text-gray-600">
                  Não enviar email quando atrasar
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={exceptions.relatorio_semanal_desativado}
                onChange={(e) => handleChange('relatorio_semanal_desativado', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900 block">
                  Excluir do relatório semanal
                </span>
                <p className="text-sm text-gray-600">
                  Este cliente não aparecerá no relatório
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Motivo */}
        {(exceptions.todos_emails_desativados || 
          exceptions.lembrete_vencimento_desativado ||
          exceptions.cobranca_atraso_desativado ||
          exceptions.relatorio_semanal_desativado) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              value={exceptions.motivo || ''}
              onChange={(e) => handleChange('motivo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              placeholder="Ex: Cliente solicitou, acordo especial, etc."
            />
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={loadExceptions}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientEmailSettings;