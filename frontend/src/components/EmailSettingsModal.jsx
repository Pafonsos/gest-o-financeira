import React, { useState, useEffect } from 'react';
import { Settings, X, Clock, Mail, AlertCircle, Check } from 'lucide-react';
import { emailSettingsService } from '../services/emailSettingsService';

export const EmailSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    lembrete_vencimento_ativo: true,
    lembrete_dias_antecedencia: 3,
    cobranca_atraso_ativo: true,
    relatorio_semanal_ativo: true,
    relatorio_dia_semana: 1,
    horario_envio: '09:00:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await emailSettingsService.getSettings();
    
    if (!error && data) {
      setSettings(data);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const { error } = await emailSettingsService.updateSettings(settings);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } else {
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    }

    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Configurações de Emails Automáticos</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            {/* Lembrete de Vencimento */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Lembrete de Vencimento</h3>
                    <p className="text-sm text-gray-600">Avisar antes do vencimento das parcelas</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lembrete_vencimento_ativo}
                    onChange={(e) => setSettings({...settings, lembrete_vencimento_ativo: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.lembrete_vencimento_ativo && (
                <div className="ml-8 mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enviar com quantos dias de antecedência?
                  </label>
                  <select
                    value={settings.lembrete_dias_antecedencia}
                    onChange={(e) => setSettings({...settings, lembrete_dias_antecedencia: parseInt(e.target.value)})}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 dia antes</option>
                    <option value="2">2 dias antes</option>
                    <option value="3">3 dias antes</option>
                    <option value="5">5 dias antes</option>
                    <option value="7">7 dias antes</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cobrança de Atraso */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Cobrança de Atraso</h3>
                    <p className="text-sm text-gray-600">Enviar email automático quando pagamento atrasar</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cobranca_atraso_ativo}
                    onChange={(e) => setSettings({...settings, cobranca_atraso_ativo: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Relatório Semanal */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Relatório Semanal</h3>
                    <p className="text-sm text-gray-600">Receber resumo semanal por email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.relatorio_semanal_ativo}
                    onChange={(e) => setSettings({...settings, relatorio_semanal_ativo: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.relatorio_semanal_ativo && (
                <div className="ml-8 mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dia da semana</label>
                    <select
                      value={settings.relatorio_dia_semana}
                      onChange={(e) => setSettings({...settings, relatorio_dia_semana: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {diasSemana.map(dia => (
                        <option key={dia.value} value={dia.value}>{dia.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                    <input
                      type="time"
                      value={settings.horario_envio}
                      onChange={(e) => setSettings({...settings, horario_envio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Informações</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Você pode desativar emails para clientes específicos na tela de detalhes</li>
                <li>• Todas as verificações são feitas automaticamente pelo sistema</li>
                <li>• Os emails são enviados apenas para você (gestor), não para os clientes</li>
              </ul>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};










