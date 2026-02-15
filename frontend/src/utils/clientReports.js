const formatarDecimalBR = (valor) => Number(valor || 0).toFixed(2).replace('.', ',');

export const criarLinhaRelatorioCSV = (cliente, status, diasAtraso = 0) => ({
  ID: cliente.id,
  'Nome do Responsável': cliente.nomeResponsavel,
  'Nome da Empresa': cliente.nomeEmpresa,
  Email: cliente.email || 'não informado',
  Telefone: cliente.telefone || 'não informado',
  'Código do Contrato': cliente.codigoContrato,
  CNPJ: cliente.cnpj || 'não informado',
  'Valor Total (R$)': formatarDecimalBR(cliente.valorTotal),
  'Valor Pago (R$)': formatarDecimalBR(cliente.valorPago),
  'Valor Restante (R$)': formatarDecimalBR((cliente.valorTotal || 0) - (cliente.valorPago || 0)),
  'Total de Parcelas': cliente.parcelas,
  'Parcelas Pagas': cliente.parcelasPagas,
  'Valor por Parcela (R$)': formatarDecimalBR(cliente.valorParcela),
  Status: status,
  'Data da Venda': cliente.dataVenda || 'não informado',
  'Próximo Vencimento': cliente.proximoVencimento || 'não informado',
  'Dias em Atraso': diasAtraso,
  Observações: cliente.observacoes || 'Nenhuma'
});

export const criarLinhaRelatorioSheets = (cliente, status, diasAtraso = 0) => ({
  ID: cliente.id,
  'Nome do Responsável': cliente.nomeResponsavel,
  'Nome da Empresa': cliente.nomeEmpresa,
  Email: cliente.email || 'não informado',
  Telefone: cliente.telefone || 'não informado',
  CNPJ: cliente.cnpj || 'não informado',
  'Código do Contrato': cliente.codigoContrato,
  'Valor Total': `R$ ${formatarDecimalBR(cliente.valorTotal)}`,
  'Valor Pago': `R$ ${formatarDecimalBR(cliente.valorPago)}`,
  'Valor Restante': `R$ ${formatarDecimalBR((cliente.valorTotal || 0) - (cliente.valorPago || 0))}`,
  Parcelas: `${cliente.parcelasPagas}/${cliente.parcelas}`,
  'Valor por Parcela': `R$ ${formatarDecimalBR(cliente.valorParcela)}`,
  Status: status,
  'Data da Venda': cliente.dataVenda || 'não informado',
  'Próximo Vencimento': cliente.proximoVencimento || 'não informado',
  'Dias em Atraso': diasAtraso,
  Observações: cliente.observacoes || 'Nenhuma'
});
