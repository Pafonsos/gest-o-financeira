import React from 'react';
import { X } from 'lucide-react';

const ClientDetailsModal = ({
  isOpen,
  clienteSelecionado,
  formatarMoeda,
  formatarData,
  onRemoveLastPayment,
  onClose
}) => {
  if (!isOpen || !clienteSelecionado) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Detalhes do Cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Informações Básicas</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-900">
                <p><span className="font-medium">Responsável:</span> {clienteSelecionado.nomeResponsavel}</p>
                <p><span className="font-medium">Empresa:</span> {clienteSelecionado.nomeEmpresa}</p>
                {clienteSelecionado.nomeFantasia && (
                  <p><span className="font-medium">Nome Fantasia:</span> {clienteSelecionado.nomeFantasia}</p>
                )}
                <p><span className="font-medium">Email:</span> {clienteSelecionado.email}</p>
                <p><span className="font-medium">Telefone:</span> {clienteSelecionado.telefone}</p>
                <p><span className="font-medium">Código do Contrato:</span> {clienteSelecionado.codigoContrato}</p>
                {clienteSelecionado.contratoDataUrl ? (
                  <p>
                    <span className="font-medium">Contrato:</span>{' '}
                    <a
                      href={clienteSelecionado.contratoDataUrl}
                      download={clienteSelecionado.contratoNome || 'contrato'}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {clienteSelecionado.contratoNome || 'Baixar contrato'}
                    </a>
                  </p>
                ) : (
                  <p>
                    <span className="font-medium">Contrato:</span>{' '}
                    <span className="text-gray-500">Nenhum contrato anexado</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Informações Financeiras</h3>
              <div className="mt-2 space-y-2 text-sm text-gray-900">
                <p><span className="font-medium">Valor Total:</span> {formatarMoeda(clienteSelecionado.valorTotal)}</p>
                <p><span className="font-medium">Valor Pago:</span> <span className="text-green-600">{formatarMoeda(clienteSelecionado.valorPago)}</span></p>
                <p><span className="font-medium">Valor Restante:</span> <span className="text-red-600">{formatarMoeda(clienteSelecionado.valorTotal - clienteSelecionado.valorPago)}</span></p>
                <p><span className="font-medium">Parcelas:</span> {clienteSelecionado.parcelasPagas}/{clienteSelecionado.parcelas}</p>
                <p><span className="font-medium">Valor por Parcela:</span> {formatarMoeda(clienteSelecionado.valorParcela)}</p>
              </div>
            </div>
          </div>
        </div>

        {clienteSelecionado.historicosPagamentos && clienteSelecionado.historicosPagamentos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Histórico de Pagamentos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Valor</th>
                    <th className="px-3 py-2 text-left">Descrição</th>
                    <th className="px-3 py-2 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clienteSelecionado.historicosPagamentos.map((pagamento, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">{formatarData(pagamento.data)}</td>
                      <td className="px-3 py-2 text-green-600 font-medium">{formatarMoeda(pagamento.valor)}</td>
                      <td className="px-3 py-2">{pagamento.descricao}</td>
                      <td className="px-3 py-2 text-center">
                        {index === clienteSelecionado.historicosPagamentos.length - 1 && (
                          <button
                            onClick={onRemoveLastPayment}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-red-600 hover:bg-red-50"
                            title="Remover último pagamento"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {clienteSelecionado.observacoes && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Observações</h3>
            <p className="mt-1 text-sm text-gray-600">{clienteSelecionado.observacoes}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
