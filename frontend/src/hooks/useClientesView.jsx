import { useMemo } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const useClientesView = (clientes, filtros) => {
  const calcularStatus = (cliente) => {
    if (cliente.valorPago >= cliente.valorTotal) return 'pago';
    if (cliente.proximoVencimento && new Date(cliente.proximoVencimento) < new Date()) return 'em_atraso';
    return 'pendente';
  };

  const calcularDiasAtraso = (dataVencimento) => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = hoje - vencimento;
    return Math.max(0, Math.ceil(diferenca / (1000 * 60 * 60 * 24)));
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const status = calcularStatus(cliente);
      const statusFiltro = filtros.status === 'todos' || status === filtros.status;
      const busca = (filtros.busca || '').toLowerCase();
      const buscaFiltro =
        busca === '' ||
        cliente.nomeResponsavel.toLowerCase().includes(busca) ||
        cliente.nomeEmpresa.toLowerCase().includes(busca);
      return statusFiltro && buscaFiltro;
    });
  }, [clientes, filtros]);

  const totais = useMemo(() => {
    return {
      totalAReceber: clientes.reduce((acc, cliente) => acc + (cliente.valorTotal - cliente.valorPago), 0),
      totalRecebido: clientes.reduce((acc, cliente) => acc + cliente.valorPago, 0),
      clientesEmAtraso: clientes.filter((cliente) => calcularStatus(cliente) === 'em_atraso').length,
      totalClientes: clientes.length
    };
  }, [clientes]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'text-green-600 bg-green-100';
      case 'em_atraso':
        return 'text-red-600 bg-red-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4" />;
      case 'em_atraso':
        return <AlertCircle className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'em_atraso':
        return 'Em Atraso';
      case 'pendente':
        return 'Pendente';
      default:
        return 'Pendente';
    }
  };

  return {
    calcularStatus,
    calcularDiasAtraso,
    clientesFiltrados,
    totais,
    getStatusColor,
    getStatusIcon,
    getStatusText
  };
};
