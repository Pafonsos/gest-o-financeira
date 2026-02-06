import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, Calendar } from 'lucide-react';

const Dashboard = ({ clientes }) => {
  const [metricas, setMetricas] = useState({
    totalReceber: 0,
    totalRecebido: 0,
    taxaRecuperacao: 0,
    clientesAtivos: 0,
    clientesEmAtraso: 0,
    crescimentoMensal: 0
  });

  const [dadosGrafico, setDadosGrafico] = useState({
    evolucaoMensal: [],
    statusClientes: [],
    recebimentosPorMes: []
  });

  // Cores para os gráficos
  const COLORS = {
    pago: '#10b981',
    pendente: '#f59e0b',
    em_atraso: '#ef4444',
    primary: '#3b82f6'
  };

  useEffect(() => {
    calcularMetricas();
    gerarDadosGraficos();
  }, [clientes]);

  const calcularMetricas = () => {
    if (!clientes || clientes.length === 0) {
      setMetricas({
        totalReceber: 0,
        totalRecebido: 0,
        taxaRecuperacao: 0,
        clientesAtivos: 0,
        clientesEmAtraso: 0,
        crescimentoMensal: 0
      });
      return;
    }

    const totalReceber = clientes.reduce((sum, c) => sum + (c.valorTotal - c.valorPago), 0);
    const totalRecebido = clientes.reduce((sum, c) => sum + c.valorPago, 0);
    const taxaRecuperacao = totalRecebido > 0 ? (totalRecebido / (totalRecebido + totalReceber)) * 100 : 0;

    const hoje = new Date();
    const clientesAtivos = clientes.filter(c => c.valorPago < c.valorTotal).length;
    const clientesEmAtraso = clientes.filter(c => {
      if (!c.proximoVencimento) return false;
      return new Date(c.proximoVencimento) < hoje && c.valorPago < c.valorTotal;
    }).length;

    // Calcular crescimento mensal
    const mesAtual = hoje.getMonth();
    const mesPassado = mesAtual - 1;
    
    const recebidoMesAtual = clientes
      .flatMap(c => c.historicosPagamentos || [])
      .filter(p => new Date(p.data).getMonth() === mesAtual)
      .reduce((sum, p) => sum + p.valor, 0);

    const recebidoMesPassado = clientes
      .flatMap(c => c.historicosPagamentos || [])
      .filter(p => new Date(p.data).getMonth() === mesPassado)
      .reduce((sum, p) => sum + p.valor, 0);

    const crescimentoMensal = recebidoMesPassado > 0 
      ? ((recebidoMesAtual - recebidoMesPassado) / recebidoMesPassado) * 100 
      : 0;

    setMetricas({
      totalReceber,
      totalRecebido,
      taxaRecuperacao,
      clientesAtivos,
      clientesEmAtraso,
      crescimentoMensal
    });
  };

  const gerarDadosGraficos = () => {
    if (!clientes || clientes.length === 0) return;

    // Status dos clientes (Pie Chart)
    const statusCount = clientes.reduce((acc, cliente) => {
      const status = calcularStatus(cliente);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusClientes = Object.entries(statusCount).map(([status, count]) => ({
      name: status === 'pago' ? 'Pago' : status === 'em_atraso' ? 'Em Atraso' : 'Pendente',
      value: count,
      color: COLORS[status]
    }));

    // Evolução mensal de pagamentos (Line Chart)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const anoAtual = new Date().getFullYear();
    
    const evolucaoMensal = meses.map((mes, index) => {
      const recebido = clientes
        .flatMap(c => c.historicosPagamentos || [])
        .filter(p => {
          const data = new Date(p.data);
          return data.getMonth() === index && data.getFullYear() === anoAtual;
        })
        .reduce((sum, p) => sum + p.valor, 0);

      return {
        mes,
        recebido: Math.round(recebido),
        index
      };
    }).filter(item => item.index <= new Date().getMonth());

    // Recebimentos por mês (Bar Chart)
    const recebimentosPorMes = evolucaoMensal.map(item => ({
      mes: item.mes,
      valor: item.recebido
    }));

    setDadosGrafico({
      evolucaoMensal,
      statusClientes,
      recebimentosPorMes
    });
  };

  const calcularStatus = (cliente) => {
    if (cliente.valorPago >= cliente.valorTotal) return 'pago';
    if (cliente.proximoVencimento && new Date(cliente.proximoVencimento) < new Date()) return 'em_atraso';
    return 'pendente';
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total a Receber"
          value={formatarMoeda(metricas.totalReceber)}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
          trend={metricas.crescimentoMensal}
        />
        
        <MetricCard
          title="Total Recebido"
          value={formatarMoeda(metricas.totalRecebido)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        
        <MetricCard
          title="Clientes Ativos"
          value={metricas.clientesAtivos}
          icon={<Users className="w-6 h-6" />}
          color="purple"
          subtitle={`${metricas.clientesEmAtraso} em atraso`}
        />
        
        <MetricCard
          title="Taxa de Recuperação"
          value={`${metricas.taxaRecuperacao.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="indigo"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Evolução de Recebimentos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico.evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="recebido" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                name="Recebido"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status dos Clientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Status dos Clientes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGrafico.statusClientes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGrafico.statusClientes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recebimentos por Mês (Bar Chart) */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Recebimentos Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico.recebimentosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatarMoeda(value)} />
              <Legend />
              <Bar dataKey="valor" fill={COLORS.primary} name="Valor Recebido" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas e Notificações */}
      {metricas.clientesEmAtraso > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="text-red-800 font-medium">
                Atenção: {metricas.clientesEmAtraso} cliente(s) em atraso
              </h4>
              <p className="text-red-700 text-sm">
                Considere enviar lembretes de cobrança atrav do sistema de email marketing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Card de Métrica
const MetricCard = ({ title, value, icon, color, trend, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default Dashboard;










