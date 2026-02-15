import { useMemo, useReducer } from 'react';

const initialState = {
  showEmailSettings: false,
  modalAberto: false,
  abaAtiva: 'clientes',
  modalPagamento: false,
  modalDetalhes: false,
  modalConfirmacao: false,
  modalConfirmacaoTodos: false,
  modalDespesa: false,
  clienteEditando: null,
  clienteSelecionado: null,
  toast: ''
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'set_field':
      return {
        ...state,
        [action.field]: action.value
      };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

export const useFinancialUiState = () => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setField = (field) => (value) => {
    dispatch({ type: 'set_field', field, value });
  };

  const setters = useMemo(() => ({
    setShowEmailSettings: setField('showEmailSettings'),
    setModalAberto: setField('modalAberto'),
    setAbaAtiva: setField('abaAtiva'),
    setModalPagamento: setField('modalPagamento'),
    setModalDetalhes: setField('modalDetalhes'),
    setModalConfirmacao: setField('modalConfirmacao'),
    setModalConfirmacaoTodos: setField('modalConfirmacaoTodos'),
    setModalDespesa: setField('modalDespesa'),
    setClienteEditando: setField('clienteEditando'),
    setClienteSelecionado: setField('clienteSelecionado'),
    setToast: setField('toast')
  }), []);

  return {
    state,
    ...setters
  };
};
