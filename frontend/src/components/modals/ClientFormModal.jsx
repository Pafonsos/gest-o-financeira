import React, { useEffect, useRef } from 'react';

const ClientFormModal = ({
  isOpen,
  clienteEditando,
  novoCliente,
  setClienteEditando,
  setNovoCliente,
  formatarCNPJ,
  formatarMoedaInput,
  handleContratoChange,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const isEditing = Boolean(clienteEditando);
  const data = isEditing ? clienteEditando : novoCliente;
  const setData = isEditing ? setClienteEditando : setNovoCliente;
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
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Editar cliente' : 'Adicionar novo cliente'}
        aria-busy={isSubmitting}
      >
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsavel *</label>
            <input
              ref={firstInputRef}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.nomeResponsavel}
              onChange={(e) => setData({ ...data, nomeResponsavel: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.nomeEmpresa}
              onChange={(e) => setData({ ...data, nomeEmpresa: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.nomeFantasia || ''}
              onChange={(e) => setData({ ...data, nomeFantasia: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              maxLength="18"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.cnpj || ''}
              onChange={(e) => setData({ ...data, cnpj: formatarCNPJ(e.target.value) })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.telefone}
              onChange={(e) => setData({ ...data, telefone: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Codigo do Contrato *</label>
            <input
              type="text"
              placeholder="Ex: CS 10.2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.codigoContrato}
              onChange={(e) => setData({ ...data, codigoContrato: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anexar Contrato</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              onChange={(e) => handleContratoChange(e.target.files && e.target.files[0] ? e.target.files[0] : null, isEditing)}
              disabled={isSubmitting}
            />
            {data.contratoNome && (
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-600">
                <span className="truncate">{data.contratoNome}</span>
                <button
                  type="button"
                  onClick={() => handleContratoChange(null, isEditing)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Remover
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link de Pagamento (Asaas)</label>
            <input
              type="url"
              placeholder="https://www.asaas.com/c/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.linkPagamento || ''}
              onChange={(e) => setData({ ...data, linkPagamento: e.target.value })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Cole o link de cobranca do Asaas</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
              <input
                type="text"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0,00"
                value={isEditing ? (data.valorTotal ? formatarMoedaInput(data.valorTotal.toString().replace(/\D/g, '')) : '') : (data.valorTotal || '')}
                onChange={(e) => setData({ ...data, valorTotal: formatarMoedaInput(e.target.value) })}
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Digite apenas numeros</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Parcelas *</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.parcelas}
              onChange={(e) => setData({ ...data, parcelas: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.dataVenda}
              onChange={(e) => setData({ ...data, dataVenda: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proximo Vencimento</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.proximoVencimento || ''}
              onChange={(e) => setData({ ...data, proximoVencimento: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows="3"
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
            aria-label="Cancelar edicao de cliente"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            disabled={isSubmitting}
            aria-label={isEditing ? 'Salvar alteracoes do cliente' : 'Adicionar cliente'}
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Adicionar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientFormModal;
