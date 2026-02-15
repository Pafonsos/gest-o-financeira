const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const mapClientFromDb = (row = {}) => {
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

export const mapClientToDb = (client = {}) => {
  const payload = {
    legacy_id: typeof client.id === 'number' ? client.id : (client.legacyId || null),
    pipefy_card_id: client.pipefyCardId || null,
    nome_responsavel: client.nomeResponsavel || '',
    nome_empresa: client.nomeEmpresa || '',
    nome_fantasia: client.nomeFantasia || null,
    email: client.email || null,
    telefone: client.telefone || null,
    cnpj: client.cnpj || null,
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

  if (typeof client.id === 'string' && UUID_REGEX.test(client.id)) {
    payload.id = client.id;
  }

  return payload;
};

export const mapDespesaFromDb = (row = {}) => ({
  id: row.id,
  fornecedor: row.fornecedor || '',
  descricao: row.descricao || '',
  valor: Number(row.valor || 0),
  vencimento: row.vencimento || '',
  pago: !!row.pago
});

export const mapDespesaToDb = (despesa = {}) => ({
  id: despesa.id || undefined,
  fornecedor: despesa.fornecedor || '',
  descricao: despesa.descricao || null,
  valor: Number(despesa.valor || 0),
  vencimento: despesa.vencimento || null,
  pago: !!despesa.pago
});
