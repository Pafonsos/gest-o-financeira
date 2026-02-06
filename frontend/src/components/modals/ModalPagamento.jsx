import React from 'react';
import { X } from 'lucide-react';

const ModalPagamento = ({ 
  isOpen, 
  onClose, 
  onSave,
  pagamentoForm,
  setPagamentoForm,
  formatarMoedaInput 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Registrar Pagamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor a Pagar (R$) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
              <input
                type="text"
                placeholder="0,00"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={pagamentoForm.valor}
                onChange={(e) => setPagamentoForm({
                  ...pagamentoForm,
                  valor: formatarMoedaInput(e.target.value)
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={pagamentoForm.data}
              onChange={(e) => setPagamentoForm({...pagamentoForm, data: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              placeholder="Observações sobre o pagamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
              value={pagamentoForm.descricao}
              onChange={(e) => setPagamentoForm({...pagamentoForm, descricao: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Registrar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPagamento;










