export const formatarCNPJ = (valor = '') => {
  const numeros = valor.toString().replace(/\D/g, '');

  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return numeros.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  if (numeros.length <= 8) return numeros.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  if (numeros.length <= 12) return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
};

export const formatarMoedaInput = (valor = '') => {
  const numeros = valor.toString().replace(/\D/g, '');
  const numero = parseFloat(numeros || '0') / 100;

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parseMoedaParaNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;

  return parseFloat(valor.toString().replace(/\./g, '').replace(',', '.')) || 0;
};

export const formatarMoeda = (valor = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor || 0));
};

export const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};
