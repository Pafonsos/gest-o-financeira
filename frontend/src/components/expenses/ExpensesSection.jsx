import React from 'react';
import { AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';

const ExpensesSection = ({ despesas, formatarMoeda, formatarData, onAddDespesa }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600">{formatarMoeda(despesas.reduce((acc, d) => !d.pago ? acc + (d.valor || 0) : acc, 0))}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pago</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(despesas.reduce((acc, d) => d.pago ? acc + (d.valor || 0) : acc, 0))}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vencidas</p>
              <p className="text-2xl font-bold text-orange-600">{despesas.filter(d => !d.pago && new Date(d.vencimento) < new Date()).length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800">Gerenciar Despesas</h3>
          </div>
          <button
            onClick={onAddDespesa}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Adicionar Despesa
          </button>
        </div>

        {despesas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fornecedor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Valor</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Vencimento</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {despesas.map((despesa, idx) => {
                  const vencido = !despesa.pago && new Date(despesa.vencimento) < new Date();
                  return (
                    <tr key={idx} className={vencido ? 'bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">{despesa.fornecedor}</td>
                      <td className="px-4 py-3 text-gray-600">{despesa.descricao}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatarMoeda(despesa.valor)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatarData(despesa.vencimento)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          despesa.pago
                            ? 'bg-green-100 text-green-800'
                            : vencido
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {despesa.pago ? 'Pago' : vencido ? 'Vencido' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma despesa cadastrada</p>
        )}
      </div>
    </>
  );
};

export default ExpensesSection;
