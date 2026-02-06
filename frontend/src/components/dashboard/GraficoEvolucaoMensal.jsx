import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const GraficoEvolucaoMensal = ({ clientes = [], despesas = [] }) => {
  const [historico, setHistorico] = useState([]);

  // Gerar grafico diario (1-31) usando entradas e saidas reais
  useEffect(() => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

    const serieDiaria = Array.from({ length: diasNoMes }, (_, idx) => ({
      dia: idx + 1,
      receita: 0,
      despesas: 0
    }));

    const clientesArray = Array.isArray(clientes) ? clientes : [];
    const despesasArray = Array.isArray(despesas) ? despesas : [];

    // Entradas: historicosPagamentos dos clientes
    clientesArray.forEach((cliente) => {
      const pagamentos = Array.isArray(cliente.historicosPagamentos)
        ? cliente.historicosPagamentos
        : [];
      pagamentos.forEach((pagamento) => {
        const data = pagamento.data ? new Date(pagamento.data) : null;
        if (!data || Number.isNaN(data.getTime())) return;
        if (data.getFullYear() !== anoAtual || data.getMonth() !== mesAtual) return;
        const dia = data.getDate();
        const valor = Number(pagamento.valor || 0);
        if (dia >= 1 && dia <= diasNoMes) {
          serieDiaria[dia - 1].receita += valor;
        }
      });
    });

    // Saidas: somar todas as despesas no mes atual (independente da data)
    despesasArray.forEach((despesa) => {
      const data = despesa.vencimento ? new Date(despesa.vencimento) : null;
      const dia = data && !Number.isNaN(data.getTime()) && data.getFullYear() === anoAtual && data.getMonth() === mesAtual
        ? data.getDate()
        : hoje.getDate();
      const valor = Number(despesa.valor || 0);
      if (dia >= 1 && dia <= diasNoMes) {
        serieDiaria[dia - 1].despesas += valor;
      }
    });

    const hasData = serieDiaria.some((d) => d.receita !== 0 || d.despesas !== 0);
    setHistorico(hasData ? serieDiaria : []);
  }, [clientes, despesas]);

  const formatMoney = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const obterValorMaximo = () => {
    if (historico.length === 0) return 1000;
    const valores = historico.flatMap(h => [h.receita, h.despesas]);
    return Math.max(...valores, 1000);
  };

  const obterValorMinimo = () => {
    if (historico.length === 0) return 0;
    return 0;
  };

  const valorMaximo = obterValorMaximo();
  const valorMinimo = obterValorMinimo();

  if (historico.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Evolu\u00e7\u00e3o Mensal</h3>
            <p className="text-sm text-gray-600">Entradas x Sa\u00eddas (por dia)</p>
          </div>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aguardando dados mensais...</p>
          <p className="text-sm text-gray-400 mt-2">O gr\u00e1fico ser\u00e1 preenchido automaticamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Evolu\u00e7\u00e3o Mensal</h3>
            <p className="text-sm text-gray-600">Dias do m\u00eas (1\u2013{historico.length})</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Sa\u00eddas</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dia"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={formatMoney}
              domain={[valorMinimo, valorMaximo]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
              formatter={(value) => [formatMoney(value), '']}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="despesas"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoEvolucaoMensal;










