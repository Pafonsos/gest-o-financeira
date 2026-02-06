import React from 'react';
import { X } from 'lucide-react';

const ModalCliente = ({ 
  isOpen, 
  onClose, 
  onSave, 
  clienteEditando, 
  novoCliente, 
  setClienteEditando, 
  setNovoCliente,
  formatarCNPJ,
  formatarMoedaInput
}) => {
  if (!isOpen) return null;

  const handleChange = (field, value, isEditing) => {
    if (isEditing) {
      setClienteEditando({...clienteEditando, [field]: value});
    } else {
      setNovoCliente({...novoCliente, [field]: value});
    }
  };

  const handleCNPJChange = (value, isEditing) => {
    const cnpjFormatado = formatarCNPJ(value);
    handleChange('cnpj', cnpjFormatado, isEditing);
  };

  const isEditing = !!clienteEditando;
  const data = isEditing ? clienteEditando : novoCliente;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.nomeResponsavel}
              onChange={(e) => handleChange('nomeResponsavel', e.target.value, isEditing)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.nomeEmpresa}
              onChange={(e) => handleChange('nomeEmpresa', e.target.value, isEditing)}
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
              onChange={(e) => handleCNPJChange(e.target.value, isEditing)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value, isEditing)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.telefone}
              onChange={(e) => handleChange('telefone', e.target.value, isEditing)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código do Contrato *</label>
            <input
              type="text"
              placeholder="Ex: CS 10.2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.codigoContrato}
              onChange={(e) => handleChange('codigoContrato', e.target.value, isEditing)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link de Pagamento (Asaas)</label>
            <input
              type="url"
              placeholder="https://www.asaas.com/c/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.linkPagamento || ''}
              onChange={(e) => handleChange('linkPagamento', e.target.value, isEditing)}
            />
            <p className="text-xs text-gray-500 mt-1">Cole o link de cobrança do Asaas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
              <input
                type="text"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0,00"
                value={data.valorTotal ? formatarMoedaInput(data.valorTotal.toString().replace(/\D/g, '')) : ''}
                onChange={(e) => handleChange('valorTotal', formatarMoedaInput(e.target.value), isEditing)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Digite apenas números</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Parcelas *</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.parcelas}
              onChange={(e) => handleChange('parcelas', e.target.value, isEditing)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda *</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.dataVenda}
              onChange={(e) => handleChange('dataVenda', e.target.value, isEditing)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Vencimento</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={data.proximoVencimento || ''}
              onChange={(e) => handleChange('proximoVencimento', e.target.value, isEditing)}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows="3"
              value={data.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value, isEditing)}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;










