import React from 'react';
import { Users, Search, Filter, Plus, Download, Settings, Trash2, CheckCircle, AlertCircle, DollarSign, Eye, Edit } from 'lucide-react';
import EmailManager from '../email/EmailManager';

const ClientsSection = ({
  exportarGoogleSheets,
  exportarRelatorio,
  exportarClientesPDF,
  exportLoading = {},
  actionLoading = {},
  onOpenEmailSettings,
  onDeleteAll,
  totais,
  formatarMoeda,
  clientes,
  filtros,
  setFiltros,
  onAddClient,
  clientesTableRef,
  onTableMouseDown,
  onTableMouseMove,
  onTableMouseUp,
  clientesFiltrados,
  calcularStatus,
  calcularDiasAtraso,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatarData,
  onViewClient,
  onRegisterPayment,
  onEditClient,
  onDeleteClient
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Ferramentas</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={exportarGoogleSheets}
            disabled={!!exportLoading.sheets}
            aria-label="Exportar clientes para Google Sheets"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.5 2.25h-15v19.5h15V2.25zm-1.5 1.5v3h-12v-3h12zm0 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-4.5v-3H18zm-6 0v3h-6v-3h6zm6 4.5v3h-12v-3h12z" />
            </svg>
            {exportLoading.sheets ? 'Exportando...' : 'Google Sheets'}
          </button>
          <button
            onClick={exportarRelatorio}
            disabled={!!exportLoading.csv}
            aria-label="Exportar clientes em CSV"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            {exportLoading.csv ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={exportarClientesPDF}
            disabled={!!exportLoading.pdf}
            aria-label="Exportar clientes em PDF"
            className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            {exportLoading.pdf ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <button
            onClick={onOpenEmailSettings}
            aria-label="Abrir configuracoes de email"
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Config. Emails
          </button>
          <button
            onClick={onDeleteAll}
            disabled={!!actionLoading.deleteAllClientes}
            aria-label="Excluir todos os clientes"
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            {actionLoading.deleteAllClientes ? 'Excluindo...' : 'Excluir Todos'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total a Receber</p>
              <p className="text-2xl font-bold text-blue-600">{formatarMoeda(totais.totalAReceber)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totais.totalRecebido)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clientes em Atraso</p>
              <p className="text-2xl font-bold text-red-600">{totais.clientesEmAtraso}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-700">{totais.totalClientes}</p>
            </div>
            <Users className="w-8 h-8 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <EmailManager clientes={clientes} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou empresa..."
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg shadow-sm">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_atraso">Em Atraso</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>

          <button
            onClick={onAddClient}
            aria-label="Adicionar novo cliente"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Adicionar Cliente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div
          ref={clientesTableRef}
          className="overflow-x-auto select-none"
          onMouseDown={onTableMouseDown}
          onMouseMove={onTableMouseMove}
          onMouseUp={onTableMouseUp}
          onMouseLeave={onTableMouseUp}
        >
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cliente ({totais.totalClientes})
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">CÃ³digo Contrato</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Valores</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Parcelas</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">PrÃ³ximo Venc.</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="bg-white/70 divide-y divide-slate-200">
              {clientesFiltrados.map((cliente, idx) => {
                const status = calcularStatus(cliente);
                const diasAtraso = calcularDiasAtraso(cliente.proximoVencimento);
                const key = `${cliente.id || cliente.email || 'idx'}-${idx}`;

                return (
                  <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{cliente.nomeResponsavel}</div>
                        <div className="text-sm text-slate-600 font-medium">{cliente.nomeEmpresa}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{cliente.email}</div>
                        <div className="text-gray-500">{cliente.telefone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.codigoContrato}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Total: {formatarMoeda(cliente.valorTotal)}</div>
                        <div className="text-green-600">Pago: {formatarMoeda(cliente.valorPago)}</div>
                        <div className="text-red-600">Restante: {formatarMoeda(cliente.valorTotal - cliente.valorPago)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min((cliente.parcelasPagas / cliente.parcelas) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span>{cliente.parcelasPagas}/{cliente.parcelas}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatarMoeda(cliente.valorParcela)} cada
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {getStatusText(status)}
                        {status === 'em_atraso' && diasAtraso > 0 && (
                          <span className="ml-1">({diasAtraso}d)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.proximoVencimento ? formatarData(cliente.proximoVencimento) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewClient(cliente)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                          aria-label={`Ver detalhes de ${cliente.nomeEmpresa}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {status !== 'pago' && (
                          <button
                            onClick={() => onRegisterPayment(cliente)}
                            className="text-green-600 hover:text-green-900"
                            title="Registrar pagamento"
                            aria-label={`Registrar pagamento de ${cliente.nomeEmpresa}`}
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onEditClient(cliente)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar cliente"
                          aria-label={`Editar cliente ${cliente.nomeEmpresa}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteClient(cliente)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir cliente"
                          aria-label={`Excluir cliente ${cliente.nomeEmpresa}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {clientesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo cliente.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientsSection;
