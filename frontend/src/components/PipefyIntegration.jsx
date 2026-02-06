import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, CloudUpload, CloudDownload, Activity } from 'lucide-react';
import pipefyService from '../services/pipefyService';

const STORAGE_KEY = 'pipefy-integration-settings';

const defaultFieldMap = {
  nomeEmpresa: '',
  nomeResponsavel: '',
  email: '',
  telefone: '',
  cnpj: '',
  valorTotal: '',
  parcelas: '',
  dataVenda: '',
  proximoVencimento: '',
  codigoContrato: '',
  linkPagamento: '',
  observacoes: ''
};

const PipefyIntegration = ({ clientes = [], onImportCards }) => {
  const [config, setConfig] = useState({
    apiToken: '',
    pipeId: '',
    fieldMap: JSON.stringify(defaultFieldMap, null, 2)
  });
  const [savedAt, setSavedAt] = useState(null);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [pipeFields, setPipeFields] = useState([]);
  const [pipePhases, setPipePhases] = useState([]);
  const [pipeCards, setPipeCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [simpleMap, setSimpleMap] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          apiToken: parsed.apiToken || '',
          pipeId: parsed.pipeId || '',
          fieldMap: parsed.fieldMap || JSON.stringify(defaultFieldMap, null, 2)
        });
        setSavedAt(parsed.savedAt || null);
        if (parsed.simpleMap) {
          setSimpleMap(parsed.simpleMap);
        }
        if (parsed.selectedClients) {
          setSelectedClients(parsed.selectedClients);
        }
        if (parsed.activeTab) {
          setActiveTab(parsed.activeTab);
        }
        if (Array.isArray(parsed.pipeFields)) {
          setPipeFields(parsed.pipeFields);
        }
        if (Array.isArray(parsed.pipePhases)) {
          setPipePhases(parsed.pipePhases);
        }
        if (Array.isArray(parsed.pipeCards)) {
          setPipeCards(parsed.pipeCards);
        }
      } catch {
        // Ignore invalid storage
      }
    }
  }, []);

  useEffect(() => {
    const payload = {
      ...config,
      simpleMap,
      selectedClients,
      activeTab,
      pipeFields,
      pipePhases,
      pipeCards,
      savedAt: savedAt || new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (!savedAt) {
      setSavedAt(payload.savedAt);
    }
  }, [config, simpleMap, selectedClients, activeTab, pipeFields, pipePhases, pipeCards, savedAt]);

  const handleSave = () => {
    const payload = { ...config, simpleMap, selectedClients, activeTab, pipeFields, pipePhases, pipeCards, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedAt(payload.savedAt);
    setStatus({ type: 'success', text: 'Configuração salva localmente.' });
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig({
      apiToken: '',
      pipeId: '',
      fieldMap: JSON.stringify(defaultFieldMap, null, 2)
    });
    setSavedAt(null);
    setSimpleMap({});
    setPipeFields([]);
    setPipePhases([]);
    setStatus({ type: '', text: '' });
    setPipeCards([]);
  };

  const isConfigured = Boolean(config.pipeId);

  const parseFieldMap = () => {
    try {
      if (Object.keys(simpleMap).length > 0) {
        return simpleMap;
      }
      return JSON.parse(config.fieldMap || '{}');
    } catch (error) {
      throw new Error('Mapa de campos inválido. Verifique o JSON.');
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const result = await pipefyService.testConnection(config.apiToken);
      setStatus({ type: 'success', text: `Conexão OK: ${result?.data?.me?.name || 'Pipefy'}` });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Falha ao testar conexão' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFields = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const result = await pipefyService.getPipeFields(config.pipeId, config.apiToken);
      const pipe = result?.data?.pipe;
      if (!pipe) {
        throw new Error('Pipe não encontrado. Verifique o Pipe ID.');
      }

      const fields = pipe.start_form_fields || [];
      const phases = pipe.phases || [];
      setPipeFields(fields);
      setPipePhases(phases);

      if (fields.length > 0) {
        const guess = {};
        const byLabel = (label) =>
          fields.find((f) => f.label?.toLowerCase() === label)?.id;

        guess.nomeEmpresa = byLabel('nome da empresa');
        guess.nomeResponsavel = byLabel('nome do cliente');
        guess.email = byLabel('e-mail');
        guess.telefone = byLabel('telefone');
        guess.cnpj = byLabel('cpf/cnpj');
        guess.observacoes = byLabel('observações');

        setSimpleMap(Object.fromEntries(
          Object.entries(guess).filter(([, value]) => value)
        ));
      }
      const resumo = [
        `Pipe: ${pipe.name} (ID: ${pipe.id})`,
        `Campos: ${fields.length}`,
        `Fases: ${phases.length}`
      ].join(' | ');

      setStatus({
        type: 'success',
        text: `${resumo}. IDs copiados para a área de transferência.`
      });

      const linhas = [
        `PIPE: ${pipe.name} (${pipe.id})`,
        '',
        'FIELDS:',
        ...fields.map((f) => `- ${f.label}: ${f.id}`),
        '',
        'PHASES:',
        ...phases.map((p) => `- ${p.name}: ${p.id}`)
      ];

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(linhas.join('\n'));
      }
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Falha ao carregar campos' });
    } finally {
      setLoading(false);
    }
  };

  const handlePushClients = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const fieldMap = parseFieldMap();
      if (selectedClients.length === 0) {
        throw new Error('Selecione ao menos um cliente para enviar.');
      }
      const selected = clientes.filter((c, idx) => {
        const key = c.id || c.email || `idx-${idx}`;
        return selectedClients.includes(key);
      });
      const result = await pipefyService.pushClients({
        pipeId: config.pipeId,
        clients: selected,
        fieldMap,
        apiToken: config.apiToken
      });

      setStatus({
        type: result.failureCount ? 'error' : 'success',
        text: `Enviados: ${result.successCount}, Falhas: ${result.failureCount}`
      });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Falha ao enviar clientes' });
    } finally {
      setLoading(false);
    }
  };

  const handlePullCards = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      const fieldMap = parseFieldMap();
      const result = await pipefyService.pullCards({
        pipeId: config.pipeId,
        limit: 50,
        apiToken: config.apiToken
      });

      const cards = result.cards || [];
      const uniqueById = new Map();
      cards.forEach((card) => {
        if (card && card.id) uniqueById.set(card.id, card);
      });
      const uniqueCards = Array.from(uniqueById.values());
      setPipeCards(uniqueCards);
      if (onImportCards) {
        onImportCards(uniqueCards, fieldMap, pipeFields);
      }

      setStatus({
        type: 'success',
        text: `Cards importados: ${uniqueCards.length}`
      });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Falha ao importar cards' });
    } finally {
      setLoading(false);
    }
  };

  const cardsByPhase = pipeCards.reduce((acc, card) => {
    const phaseId = card.current_phase?.id || 'sem-fase';
    if (!acc[phaseId]) acc[phaseId] = [];
    acc[phaseId].push(card);
    return acc;
  }, {});

  const handleMoveCard = async () => {
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      if (!selectedCardId || !selectedPhaseId) {
        throw new Error('Selecione o card e a fase.');
      }
      await pipefyService.moveCard({
        cardId: selectedCardId,
        phaseId: selectedPhaseId,
        apiToken: config.apiToken
      });
      setStatus({ type: 'success', text: 'Card movido com sucesso.' });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || 'Falha ao mover card' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Integração Pipefy</h3>
          <p className="text-sm text-slate-600">Configure tokens e IDs para iniciar a integração.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${
          isConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isConfigured ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {isConfigured ? 'Configuração ok' : 'Configuração pendente'}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex flex-wrap gap-2">
        {[
          { id: 'config', label: 'Configuração + Sincronização' },
          { id: 'map', label: 'Mapeamento' },
          { id: 'pipe', label: 'Visão do Pipe + Mover Cards' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-slate-800 mb-4">Passo a passo rápido</h4>
          <ol className="text-sm text-slate-600 space-y-2">
            <li>1. Preencha o Pipe ID.</li>
            <li>2. Clique em “Carregar Campos do Pipe”.</li>
            <li>3. Faça o mapeamento simples abaixo.</li>
            <li>4. Clique em “Enviar clientes”.</li>
            <li>5. Use “Importar cards” quando quiser puxar atualizações.</li>
          </ol>

          <h4 className="font-semibold text-slate-800 mt-6 mb-4">Credenciais e IDs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
              <input
                type="password"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={config.apiToken}
                onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                placeholder="Cole o token de API do Pipefy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pipe ID</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={config.pipeId}
                onChange={(e) => setConfig({ ...config, pipeId: e.target.value })}
                placeholder="Ex: 987654"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6 flex-wrap">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Salvar Configuração
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md disabled:opacity-60"
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Testar Conexão
            </button>
            <button
              onClick={handleLoadFields}
              disabled={loading || !config.pipeId || !config.apiToken}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-60"
            >
              Carregar Campos do Pipe
            </button>
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAdvanced ? 'Ocultar JSON' : 'Mostrar JSON'}
            </button>
          </div>
          {savedAt && (
            <p className="text-xs text-slate-500 mt-3">
              Última atualização: {new Date(savedAt).toLocaleString('pt-BR')}
            </p>
          )}
          {status.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              status.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status.text}
            </div>
          )}
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg shadow-md p-6 border border-slate-200/60">
            <h4 className="font-semibold text-slate-800 mb-3">Sincronização</h4>
            <ul className="text-sm text-slate-600 space-y-2 mb-4">
              <li>Defina o Pipe ID e os field_ids no mapa.</li>
              <li>Teste a conexão antes de sincronizar.</li>
              <li>Selecione quais clientes deseja enviar.</li>
              <li>Use "Importar cards" para atualizar o sistema.</li>
            </ul>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePushClients}
                disabled={loading || clientes.length === 0 || selectedClients.length === 0}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-60"
              >
                <CloudUpload className="w-4 h-4 inline mr-2" />
                Enviar clientes
              </button>
              <button
                onClick={handlePullCards}
                disabled={loading}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-60"
              >
                <CloudDownload className="w-4 h-4 inline mr-2" />
                Importar cards
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-slate-800 mb-2">Mapeamento simples</h4>
          <p className="text-xs text-slate-500 mb-3">
            Selecione qual campo do Pipefy corresponde a cada informação do sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(defaultFieldMap).map((key) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{key}</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={simpleMap[key] || ''}
                  onChange={(e) => setSimpleMap({ ...simpleMap, [key]: e.target.value })}
                  disabled={pipeFields.length === 0}
                >
                  <option value="">(não usar)</option>
                  {pipeFields.map((f) => (
                    <option key={f.id} value={f.id}>{f.label} ({f.id})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAdvanced ? 'Ocultar JSON' : 'Mostrar JSON'}
            </button>
          </div>

          {showAdvanced && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mapa de Campos (JSON)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-xs"
                rows="8"
                value={config.fieldMap}
                onChange={(e) => setConfig({ ...config, fieldMap: e.target.value })}
                placeholder='{"email":"field_id"}'
              />
              <p className="text-xs text-slate-500 mt-1">
                Se preferir, você pode editar o JSON manualmente.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h4 className="font-semibold text-slate-800 mb-3">Selecionar clientes</h4>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                const keys = clientes.map((c, idx) => c.id || c.email || `idx-${idx}`);
                setSelectedClients(keys);
              }}
              className="px-3 py-2 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Selecionar todos
            </button>
            <button
              onClick={() => setSelectedClients([])}
              className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
            >
              Limpar
            </button>
            <span className="text-xs text-slate-500 self-center">
              {selectedClients.length} selecionado(s)
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-lg p-2">
            {clientes.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum cliente cadastrado</p>
            ) : (
              clientes.map((cliente, idx) => {
                const key = cliente.id || cliente.email || `idx-${idx}`;
                const checked = selectedClients.includes(key);
                return (
                  <label key={`${key}-${idx}`} className="flex items-center gap-2 px-2 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedClients((prev) =>
                          prev.includes(key)
                            ? prev.filter((k) => k !== key)
                            : [...prev, key]
                        );
                      }}
                    />
                    <span className="font-medium">{cliente.nomeEmpresa || cliente.nomeResponsavel || cliente.email || 'Cliente'}</span>
                    {cliente.email && (
                      <span className="text-slate-400">({cliente.email})</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'pipe' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-slate-800 mb-3">Mover cards de fase (manual)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
              >
                <option value="">Selecione um card</option>
                {pipeCards.map((card, index) => (
                  <option key={`${card.id}-${index}`} value={card.id}>{card.title} ({card.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedPhaseId}
                onChange={(e) => setSelectedPhaseId(e.target.value)}
              >
                <option value="">Selecione uma fase</option>
                {pipePhases.map((phase) => (
                  <option key={phase.id} value={phase.id}>{phase.name} ({phase.id})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleMoveCard}
                disabled={loading || !selectedCardId || !selectedPhaseId}
                className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-md disabled:opacity-60"
              >
                Mover Card
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Dica: clique em “Carregar Campos do Pipe” e depois “Importar cards” para listar os cards.
          </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800">Visão do Pipe (colunas)</h4>
              <button
                onClick={handlePullCards}
                disabled={loading}
                className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                Atualizar visão
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {pipePhases.length === 0 && (
                <div className="text-sm text-slate-500">
                  Clique em “Carregar Campos do Pipe” para trazer as fases.
                </div>
              )}
              {pipePhases.map((phase, idx) => {
                const cards = cardsByPhase[phase.id] || [];
                return (
                  <div key={`${phase.id}-${idx}`} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-800">{phase.name}</span>
                      <span className="text-xs text-slate-500">{cards.length}</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cards.length === 0 ? (
                        <div className="text-xs text-slate-400">Sem cards</div>
                      ) : (
                        cards.map((card, cidx) => (
                          <div key={`${card.id}-${cidx}`} className="bg-white border border-slate-200 rounded-md px-2 py-2 text-xs text-slate-700">
                            <div className="font-semibold">{card.title}</div>
                            <div className="text-slate-400">{card.id}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipefyIntegration;
