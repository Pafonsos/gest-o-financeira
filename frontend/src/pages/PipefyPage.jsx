import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PipefyIntegration from '../components/PipefyIntegration';
import ProfileMenu from '../components/ProfileMenu';
import '../pages/AdminPage.css';

const parseMoedaParaNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.')) || 0;
};

const PipefyPage = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('financial-manager-clientes');
    if (dadosSalvos) {
      try {
        setClientes(JSON.parse(dadosSalvos));
      } catch {
        setClientes([]);
      }
    }
  }, []);

  const applyPipefyImport = (cards, fieldMap, pipeFields = []) => {
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
        .map((v) => String(v).toLowerCase());
    };

    const getFieldValue = (fields, fieldIdOrName) => {
      if (!fieldIdOrName) return '';
      const candidates = resolveFieldCandidates(fieldIdOrName);
      const found = fields.find((f) => {
        const name = String(f.name || '').toLowerCase();
        const fieldId = String(f.field?.id || '').toLowerCase();
        const fieldLabel = String(f.field?.label || '').toLowerCase();
        return candidates.includes(name) || candidates.includes(fieldId) || candidates.includes(fieldLabel);
      });
      return normalizeValue(found?.value || '');
    };

    const fallbackByLabel = (label) => {
      const found = fieldLookup.find((f) => f.label?.toLowerCase() === label);
      return found?.id || '';
    };

    const mapId = (key, label) => fieldMap?.[key] || fallbackByLabel(label);

    const imported = cards.map((card) => {
      const fields = Array.isArray(card.fields) ? card.fields : [];
    const nomeEmpresa = normalize(getFieldValue(fields, mapId('nomeEmpresa', 'nome da empresa'))) || card.title || '';
    const nomeResponsavel = normalize(getFieldValue(fields, mapId('nomeResponsavel', 'nome do cliente')));
    const email = normalize(getFieldValue(fields, mapId('email', 'e-mail')));
    const telefone = normalize(getFieldValue(fields, mapId('telefone', 'telefone')));
    const cnpj = normalize(getFieldValue(fields, mapId('cnpj', 'cpf/cnpj')));
    const codigoContrato = normalize(getFieldValue(fields, mapId('codigoContrato', 'codigo do contrato')));
    const valorTotal = parseMoedaParaNumero(getFieldValue(fields, mapId('valorTotal', 'valor total')));
    const parcelas = parseInt(getFieldValue(fields, mapId('parcelas', 'parcelas')), 10) || 1;
    const dataVenda = normalize(getFieldValue(fields, mapId('dataVenda', 'data da venda')));
    const proximoVencimento = normalize(getFieldValue(fields, mapId('proximoVencimento', 'proximo vencimento')));
    const linkPagamento = normalize(getFieldValue(fields, mapId('linkPagamento', 'link de pagamento')));
    const observacoes = normalize(getFieldValue(fields, mapId('observacoes', 'observações')));

      return {
        id: card.id,
        pipefyCardId: card.id,
        nomeResponsavel,
        nomeEmpresa,
        email,
        telefone,
        valorTotal,
        parcelas,
        dataVenda,
        proximoVencimento,
        cnpj,
        codigoContrato,
        linkPagamento,
        observacoes,
        valorPago: 0,
        parcelasPagas: 0,
        historicosPagamentos: []
      };
    });

    setClientes((prev) => {
      const updated = [...prev];
      imported.forEach((cliente) => {
        const matchIndex = updated.findIndex((c) => {
          if (cliente.pipefyCardId && c.pipefyCardId === cliente.pipefyCardId) return true;
          if (cliente.pipefyCardId && String(c.id) === String(cliente.pipefyCardId)) return true;
          if (String(c.id) === String(cliente.id)) return true;
          if (cliente.email && c.email === cliente.email) return true;
          if (cliente.cnpj && c.cnpj === cliente.cnpj) return true;
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
      localStorage.setItem('financial-manager-clientes', JSON.stringify(deduped));
      return deduped;
      });
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
