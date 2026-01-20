// ============================================
// ARQUIVO: src/components/dashboard/DashboardAprimorado.js
// ============================================

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const DashboardAprimorado = ({ clientes }) => {
  const [metricas, setMetricas] = useState({
    receitaRealizada: 0,
    receitaPrevista: 0,
    receitaPendente: 0,
    inadimplencia: 0,
    ticketMedio: 0,
    previsaoProximoMes: 0
  });

  useEffect(() => {
    calcularMetricas();
  }, [clientes]);

  const calcularMetricas = () => {
    if (!clientes || clientes.length === 0) return;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Receita Realizada (pago)
    const receitaRealizada = clientes.reduce((sum, c) => sum + (c.valorPago || 0), 0);

    // Receita Prevista Total
    const receitaPrevista = clientes.reduce((sum, c) => sum + (c.valorTotal || 0), 0);

    // Receita Pendente
    const receitaPendente = receitaPrevista - receitaRealizada;

    // Taxa de Inadimplência
    const totalAtrasado = clientes
      .filter(c => {
        if (!c.proximoVencimento) return false;
        return new Date(c.proximoVencimento) < hoje && c.valorPago < c.valorTotal;
      })
      .reduce((sum, c) => sum + (c.valorTotal - c.valorPago), 0);

    const inadimplencia = receitaPrevista > 0 ? (totalAtrasado / receitaPrevista) * 100 : 0;

    // Ticket Médio
    const ticketMedio = clientes.length > 0 ? receitaPrevista / clientes.length : 0;

    // Previsão próximo mês
    const proximoMes = new Date(anoAtual, mesAtual + 1, 1);
    const fimProximoMes = new Date(anoAtual, mesAtual + 2, 0);
    
    const previsaoProximoMes = clientes
      .filter(c => {
        if (!c.proximoVencimento || c.valorPago >= c.valorTotal) return false;
        const venc = new Date(c.proximoVencimento);
        return venc >= proximoMes && venc <= fimProximoMes;
      })
      .reduce((sum, c) => sum + c.valorParcela, 0);

    setMetricas({
      receitaRealizada,
      receitaPrevista,
      receitaPendente,
      inadimplencia,
      ticketMedio,
      previsaoProximoMes
    });
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Realizada"
          value={formatMoney(metricas.receitaRealizada)}
          subtitle={`${((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0).toFixed(1)}% do previsto`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        
        <MetricCard
          title="Receita Pendente"
          value={formatMoney(metricas.receitaPendente)}
          subtitle="A receber"
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
        />
        
        <MetricCard
          title="Taxa de Inadimplência"
          value={`${metricas.inadimplencia.toFixed(1)}%`}
          subtitle={metricas.inadimplencia > 10 ? "Atenção necessária" : "Dentro do aceitável"}
          icon={AlertCircle}
          color={metricas.inadimplencia > 10 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}
        />
        
        <MetricCard
          title="Ticket Médio"
          value={formatMoney(metricas.ticketMedio)}
          subtitle={`${clientes.length} clientes ativos`}
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Previsão e Saúde Financeira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Previsão Próximo Mês */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Previsão Próximo Mês</h3>
          </div>
          <p className="text-3xl font-bold text-blue-900 mb-2">
            {formatMoney(metricas.previsaoProximoMes)}
          </p>
          <p className="text-sm text-blue-700">
            Receita prevista com parcelas que vencem
          </p>
        </div>

        {/* Saúde Financeira */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Saúde Financeira</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Receita Realizada</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(metricas.receitaRealizada / metricas.receitaPrevista) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Inadimplência</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metricas.inadimplencia > 10 ? 'bg-red-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(metricas.inadimplencia, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {metricas.inadimplencia.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-5 h-5 ${
                  metricas.inadimplencia < 10 && metricas.receitaRealizada > 0
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`} />
                <span className={
                  metricas.inadimplencia < 10 && metricas.receitaRealizada > 0
                    ? 'text-green-600 font-medium'
                    : 'text-yellow-600 font-medium'
                }>
                  {metricas.inadimplencia < 10 && metricas.receitaRealizada > 0
                    ? 'Situação financeira saudável'
                    : 'Requer atenção'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {metricas.inadimplencia > 10 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-bold mb-1">
                Alta Taxa de Inadimplência
              </h4>
              <p className="text-red-700 text-sm">
                Sua taxa de inadimplência está acima do recomendado (10%). 
                Considere intensificar as cobranças usando o sistema de email marketing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAprimorado;