import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

const GraficoEvolucaoMensal = ({ clientes = [], despesas = [] }) => {
  const [historico, setHistorico] = useState([]);

  // Gerar gráfico diário (1–31) usando entradas e saídas reais
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

    // Saídas: somar todas as despesas no mês atual (independente da data)
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

  const calcularPosicaoY = (valor, max, min) => {
    const range = max - min;
    const posicao = ((max - valor) / range) * 100;
    return Math.max(0, Math.min(100, posicao));
  };

  const calcularPosicaoX = (index, total) => {
    return (index / (total - 1)) * 100;
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
            <h3 className="text-lg font-bold text-gray-900">Evolução Mensal</h3>
            <p className="text-sm text-gray-600">Entradas x Saídas (colunas por dia)</p>
          </div>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Aguardando dados mensais...</p>
          <p className="text-sm text-gray-400 mt-2">O gráfico será preenchido automaticamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Evolução Mensal</h3>
            <p className="text-sm text-gray-600">Dias do mês (1–{historico.length})</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Linhas */}
      <div className="relative">
        {/* Labels do Eixo Y */}
        <div className="absolute left-0 top-0 bottom-12 w-16 flex flex-col justify-between text-xs text-gray-500 font-medium">
          <span className="text-right">{formatMoney(valorMaximo)}</span>
          <span className="text-right">{formatMoney((valorMaximo + valorMinimo) / 2)}</span>
          <span className="text-right">{formatMoney(valorMinimo)}</span>
        </div>

        {/* Área do Gráfico */}
        <div className="ml-20 mr-4">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-80 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100"
            preserveAspectRatio="none"
          >
            {/* Grid horizontal */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.2" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.3" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.2" />

            {/* Grid vertical */}
            {historico.map((_, index) => {
              const x = calcularPosicaoX(index, historico.length);
              return (
                <line 
                  key={index}
                  x1={x} 
                  y1="0" 
                  x2={x} 
                  y2="100" 
                  stroke="#e5e7eb" 
                  strokeWidth="0.2" 
                  strokeDasharray="1,1"
                />
              );
            })}

            {/* Colunas (Entradas e Saídas) */}
            {historico.map((item, index) => {
              const xCenter = calcularPosicaoX(index, historico.length);
              const barWidth = 1.8;
              const gap = 0.3;

              const receitaY = calcularPosicaoY(item.receita, valorMaximo, valorMinimo);
              const despesaY = calcularPosicaoY(item.despesas, valorMaximo, valorMinimo);

              const receitaHeight = 100 - receitaY;
              const despesaHeight = 100 - despesaY;

              return (
                <g key={`colunas-${index}`}>
                  <rect
                    x={xCenter - barWidth - gap}
                    y={receitaY}
                    width={barWidth}
                    height={receitaHeight}
                    fill="url(#gradientReceita)"
                    rx="0.3"
                  >
                    <title>Entrada (dia {item.dia}): {formatMoney(item.receita)}</title>
                  </rect>
                  <rect
                    x={xCenter + gap}
                    y={despesaY}
                    width={barWidth}
                    height={despesaHeight}
                    fill="url(#gradientDespesas)"
                    rx="0.3"
                  >
                    <title>Saída (dia {item.dia}): {formatMoney(item.despesas)}</title>
                  </rect>
                </g>
              );
            })}

            {/* Gradientes */}
            <defs>
              <linearGradient id="gradientReceita" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="gradientDespesas" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels do Eixo X (dias) */}
          <div className="flex justify-between mt-3 px-1">
            {historico.map((item, index) => {
              const isLast = index === historico.length - 1;
              const showLabel = item.dia % 5 === 0 || item.dia === 1 || isLast;
              return (
                <div key={index} className="text-xs font-semibold text-gray-600 uppercase text-center flex-1">
                  {showLabel ? item.dia : ''}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-8 mt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Entradas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Saídas</span>
        </div>
      </div>

    </div>
  );
};

export default GraficoEvolucaoMensal;
