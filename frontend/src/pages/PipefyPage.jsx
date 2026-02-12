import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PipefyIntegration from '../components/PipefyIntegration';
import ProfileMenu from '../components/ProfileMenu';
import '../pages/AdminPage.css';
import { supabase } from '../lib/supabaseClient';

const parseMoedaParaNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.')) || 0;
};

const normalizeKey = (value) =>
  (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const PipefyPage = () => {
  const [clientes, setClientes] = useState([]);

  const mapClientFromDb = (row) => {
    const rawContrato = row.contrato_data_url || '';
    const isDataUrl = rawContrato.startsWith('data:');
    return {
      id: row.id,
      legacyId: row.legacy_id || null,
      pipefyCardId: row.pipefy_card_id || null,
      nomeResponsavel: row.nome_responsavel || '',
      nomeEmpresa: row.nome_empresa || '',
      nomeFantasia: row.nome_fantasia || '',
      email: row.email || '',
      telefone: row.telefone || '',
      cnpj: row.cnpj || '',
      cpf: row.cpf || '',
      codigoContrato: row.codigo_contrato || '',
      contratoNome: row.contrato_nome || '',
      contratoPath: isDataUrl ? '' : rawContrato,
      contratoDataUrl: isDataUrl ? rawContrato : '',
      linkPagamento: row.link_pagamento || '',
      valorTotal: Number(row.valor_total || 0),
      valorPago: Number(row.valor_pago || 0),
      parcelas: row.parcelas ?? 1,
      parcelasPagas: row.parcelas_pagas ?? 0,
      valorParcela: Number(row.valor_parcela || 0),
      dataVenda: row.data_venda || '',
      proximoVencimento: row.proximo_vencimento || '',
      observacoes: row.observacoes || '',
      historicosPagamentos: row.historicos_pagamentos || []
    };
  };

  const mapClientToDb = (client) => {
    const payload = {
      legacy_id: client.legacyId || null,
      pipefy_card_id: client.pipefyCardId || null,
      nome_responsavel: client.nomeResponsavel || '',
      nome_empresa: client.nomeEmpresa || '',
      nome_fantasia: client.nomeFantasia || null,
      email: client.email || null,
      telefone: client.telefone || null,
      cnpj: client.cnpj || null,
      cpf: client.cpf || null,
      codigo_contrato: client.codigoContrato || null,
      contrato_nome: client.contratoNome || null,
      contrato_data_url: client.contratoPath || null,
      link_pagamento: client.linkPagamento || null,
      valor_total: Number(client.valorTotal || 0),
      valor_pago: Number(client.valorPago || 0),
      parcelas: Number(client.parcelas || 1),
      parcelas_pagas: Number(client.parcelasPagas || 0),
      valor_parcela: Number(client.valorParcela || 0),
      data_venda: client.dataVenda || null,
      proximo_vencimento: client.proximoVencimento || null,
      observacoes: client.observacoes || null,
      historicos_pagamentos: client.historicosPagamentos || []
    };

    if (typeof client.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(client.id)) {
      payload.id = client.id;
    }

    return payload;
  };

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        setClientes((data || []).map(mapClientFromDb));
      } catch (error) {
        console.error('Erro ao carregar clientes do Supabase:', error);
        setClientes([]);
      }
    };

    loadClientes();
  }, []);

  const applyPipefyImport = async (cards, fieldMap, pipeFields = []) => {
    if (!Array.isArray(cards) || cards.length === 0) return;

    const fieldLookup = Array.isArray(pipeFields) ? pipeFields : [];
    const normalize = (value) => (value || '').toString().trim();

    const normalizeValue = (value) => {
      if (value === null || value === undefined) return '';
      if (Array.isArray(value)) {
        return value.map((item) => normalizeValue(item)).filter(Boolean).join(', ');
      }
      if (typeof value === 'object') {
        if (value.name) return String(value.name);
        if (value.title) return String(value.title);
        if (value.url) return String(value.url);
        if (value.value) return normalizeValue(value.value);
        return JSON.stringify(value);
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          try {
            return normalizeValue(JSON.parse(trimmed));
          } catch {
            return trimmed;
          }
        }
        return trimmed;
      }
      return String(value);
    };

    const resolveFieldCandidates = (fieldIdOrName) => {
      if (!fieldIdOrName) return [];
      const fromPipe = fieldLookup.find((f) => f.id === fieldIdOrName);
      return [
        fieldIdOrName,
        fromPipe?.label,
        fromPipe?.id
      ]
        .filter(Boolean)
        .map((v) => normalizeKey(v));
    };

    const getFieldValue = (fields, fieldIdOrName) => {
      if (!fieldIdOrName) return '';
      const candidates = resolveFieldCandidates(fieldIdOrName);
      const found = fields.find((f) => {
        const name = normalizeKey(f.name || '');
        const fieldId = normalizeKey(f.field?.id || '');
        const fieldLabel = normalizeKey(f.field?.label || '');
        return candidates.includes(name) || candidates.includes(fieldId) || candidates.includes(fieldLabel);
      });
      return normalizeValue(found?.value || '');
    };

    const fallbackByLabel = (label) => {
      const wanted = normalizeKey(label);
      const found = fieldLookup.find((f) => normalizeKey(f.label) === wanted);
      return found?.id || '';
    };

    const mapId = (key, label) => fieldMap?.[key] || fallbackByLabel(label);
    const mapIdAny = (key, labels) =>
      fieldMap?.[key] || labels.map((label) => fallbackByLabel(label)).find(Boolean) || '';

    const imported = cards.map((card) => {
      const fields = Array.isArray(card.fields) ? card.fields : [];
    const nomeEmpresa = normalize(getFieldValue(fields, mapId('nomeEmpresa', 'nome da empresa'))) || card.title || '';
    const nomeFantasia = normalize(getFieldValue(fields, mapId('nomeFantasia', 'nome fantasia')));
    const nomeResponsavel = normalize(getFieldValue(fields, mapId('nomeResponsavel', 'nome do cliente')));
    const email = normalize(getFieldValue(fields, mapIdAny('email', ['e-mail', 'email'])));
    const telefone = normalize(getFieldValue(fields, mapId('telefone', 'telefone')));
    const cnpj = normalize(getFieldValue(fields, mapIdAny('cnpj', ['cnpj', 'cpf/cnpj'])));
    const cpf = normalize(getFieldValue(fields, mapIdAny('cpf', ['cpf', 'cpf/cnpj'])));
    const codigoContrato = normalize(getFieldValue(fields, mapIdAny('codigoContrato', ['codigo do contrato', 'código do contrato'])));
    const valorTotal = parseMoedaParaNumero(getFieldValue(fields, mapIdAny('valorTotal', ['valor total do contrato', 'valor total'])));
    const parcelas = parseInt(getFieldValue(fields, mapId('parcelas', 'parcelas')), 10) || 1;
    const dataVenda = normalize(getFieldValue(fields, mapId('dataVenda', 'data da venda')));
    const proximoVencimento = normalize(getFieldValue(fields, mapId('proximoVencimento', 'proximo vencimento')));
    const linkPagamento = normalize(getFieldValue(fields, mapId('linkPagamento', 'link de pagamento')));
    const observacoes = normalize(getFieldValue(fields, mapId('observacoes', 'observações')));

      return {
        id: null,
        pipefyCardId: card.id,
        nomeResponsavel,
        nomeEmpresa,
        nomeFantasia,
        email,
        telefone,
        valorTotal,
        parcelas,
        dataVenda,
        proximoVencimento,
        cnpj,
        cpf,
        codigoContrato,
        linkPagamento,
        observacoes,
        valorPago: 0,
        parcelasPagas: 0,
        historicosPagamentos: []
      };
    });

    const updated = [...clientes];
    imported.forEach((cliente) => {
      const matchIndex = updated.findIndex((c) => {
        if (cliente.pipefyCardId && c.pipefyCardId === cliente.pipefyCardId) return true;
        if (cliente.pipefyCardId && String(c.id) === String(cliente.pipefyCardId)) return true;
        if (String(c.id) === String(cliente.id)) return true;
        if (cliente.email && c.email === cliente.email) return true;
        if (cliente.cnpj && c.cnpj === cliente.cnpj) return true;
        if (cliente.cpf && c.cpf === cliente.cpf) return true;
        if (cliente.codigoContrato && c.codigoContrato === cliente.codigoContrato) return true;
        return false;
      });

      if (matchIndex >= 0) {
        const current = updated[matchIndex];
        updated[matchIndex] = {
          ...current,
          ...cliente,
          pipefyCardId: current.pipefyCardId || cliente.pipefyCardId || current.id || cliente.id
        };
      } else {
        updated.push(cliente);
      }
    });
    const dedupedMap = new Map();
    updated.forEach((cliente) => {
      const key =
        cliente.pipefyCardId
          ? `pipe:${cliente.pipefyCardId}`
          : cliente.email
          ? `email:${cliente.email}`
          : cliente.cnpj
          ? `cnpj:${cliente.cnpj}`
          : cliente.cpf
          ? `cpf:${cliente.cpf}`
          : cliente.codigoContrato
          ? `contrato:${cliente.codigoContrato}`
          : `id:${cliente.id}`;
      if (!dedupedMap.has(key)) {
        dedupedMap.set(key, cliente);
      } else {
        dedupedMap.set(key, { ...dedupedMap.get(key), ...cliente });
      }
    });
    const deduped = Array.from(dedupedMap.values());
    setClientes(deduped);

    try {
      const rowsWithId = deduped
        .filter((cliente) => !!cliente.id)
        .map((cliente) => mapClientToDb(cliente));

      const rowsWithoutId = deduped
        .filter((cliente) => !cliente.id)
        .map((cliente) => mapClientToDb({ ...cliente, id: undefined }));

      if (rowsWithId.length > 0) {
        const { error } = await supabase
          .from('clientes')
          .upsert(rowsWithId, { onConflict: 'id' });
        if (error) throw error;
      }

      if (rowsWithoutId.length > 0) {
        const { error } = await supabase
          .from('clientes')
          .insert(rowsWithoutId);
        if (error) throw error;
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setClientes((data || []).map(mapClientFromDb));
    } catch (error) {
      console.error('Erro ao salvar importação no Supabase:', error);
    }
    };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-topbar">
          <Link to="/dashboard" className="admin-logo" aria-label="Voltar ao início">
            <img
              src="/logo-proteq.png"
              alt="PROTEQ Logo"
              className="admin-logo-image"
              onError={(e) => (e.target.style.display = 'none')}
            />
          </Link>
          <ProfileMenu />
        </div>
        <PipefyIntegration
          clientes={clientes}
          onImportCards={applyPipefyImport}
        />
      </div>
    </div>
  );
};

export default PipefyPage;










