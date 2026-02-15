import React, { useEffect, useRef } from 'react';

const PaymentModal = ({
  isOpen,
  clienteSelecionado,
  pagamentoForm,
  setPagamentoForm,
  formatarMoeda,
  onClose,
  onConfirm,
  isSubmitting = false
}) => {
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="presentation">
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-label="Registrar pagamento"
        aria-busy={isSubmitting}
      >
        <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
        <p className="text-sm text-gray-600 mb-4">
          Cliente: <span className="font-medium">{clienteSelecionado?.nomeEmpresa}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Pagamento *</label>
            <input
              ref={firstInputRef}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={pagamentoForm.valor}
              onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor: e.target.value })}
              placeholder="0,00"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Valor da parcela: {clienteSelecionado && formatarMoeda(clienteSelecionado.valorParcela)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={pagamentoForm.data}
              onChange={(e) => setPagamentoForm({ ...pagamentoForm, data: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={pagamentoForm.descricao}
              onChange={(e) => setPagamentoForm({ ...pagamentoForm, descricao: e.target.value })}
              placeholder="Ex: 3a parcela"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
            aria-label="Cancelar pagamento"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
            disabled={isSubmitting}
            aria-label="Confirmar pagamento"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
