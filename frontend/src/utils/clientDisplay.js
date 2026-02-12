export const getClienteTitulo = (cliente = {}) => {
  if (cliente.nomeEmpresa && cliente.nomeEmpresa.trim() !== '') {
    return cliente.nomeEmpresa;
  }
  if (cliente.nomeResponsavel && cliente.nomeResponsavel.trim() !== '') {
    return cliente.nomeResponsavel;
  }
  if (cliente.nome && cliente.nome.trim() !== '') {
    return cliente.nome;
  }
  return 'Cliente';
};

export const getClienteSubtitulo = (cliente = {}) => {
  if (cliente.nomeResponsavel && cliente.nomeResponsavel.trim() !== '') {
    return `Responsavel: ${cliente.nomeResponsavel}`;
  }
  if (cliente.email && cliente.email.trim() !== '') {
    return cliente.email;
  }
  return 'Sem responsavel definido';
};
