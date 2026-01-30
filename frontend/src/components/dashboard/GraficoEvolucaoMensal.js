import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

const GraficoEvolucaoMensal = ({ metricas }) => {
  const [historico, setHistorico] = useState([]);

  // Carregar histórico ao iniciar
  useEffect(() => {
    const dados = localStorage.getItem('historico-mensal-proteq');
    if (dados) {
      setHistorico(JSON.parse(dados));
    }
  }, []);

  // Salvar dados do mês atual sempre que as métricas mudarem
  useEffect(() => {
    if (metricas.receitaRealizada === 0) return;

    const hoje = new Date();
    const mesAno = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const mesNome = hoje.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

    const historicoAtual = [...historico];
    const indexExistente = historicoAtual.findIndex(h => h.periodo === mesAno);

    const novoRegistro = {
      periodo: mesAno,
      mesNome: mesNome,
      receita: metricas.receitaRealizada,
      despesas: metricas.despesasTotais,
      lucro: metricas.lucroOperacional
    };

    if (indexExistente >= 0) {
      historicoAtual[indexExistente] = novoRegistro;
    } else {
      historicoAtual.push(novoRegistro);
    }

    const ultimos6Meses = historicoAtual.slice(-6);
    setHistorico(ultimos6Meses);
    localStorage.setItem('historico-mensal-proteq', JSON.stringify(ultimos6Meses));
  }, [metricas.receitaRealizada, metricas.despesasTotais, metricas.lucroOperacional]);

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

  const calcularVariacao = () => {
    if (historico.length < 2) return null;
    
    const mesAtual = historico[historico.length - 1];
    const mesAnterior = historico[historico.length - 2];
    
    const variacaoReceita = ((mesAtual.receita - mesAnterior.receita) / mesAnterior.receita) * 100;
    const variacaoDespesas = ((mesAtual.despesas - mesAnterior.despesas) / mesAnterior.despesas) * 100;
    const variacaoLucro = mesAnterior.lucro !== 0 
      ? ((mesAtual.lucro - mesAnterior.lucro) / Math.abs(mesAnterior.lucro)) * 100 
      : 0;

    return {
      receita: variacaoReceita,
      despesas: variacaoDespesas,
      lucro: variacaoLucro,
      mesAnterior: mesAnterior.mesNome
    };
  };

  const obterValorMaximo = () => {
    if (historico.length === 0) return 1000;
    const valores = historico.flatMap(h => [h.receita, h.despesas, Math.abs(h.lucro)]);
    return Math.max(...valores, 1000);
  };

  const obterValorMinimo = () => {
    if (historico.length === 0) return 0;
    const valores = historico.map(h => h.lucro);
    const minimo = Math.min(...valores, 0);
    return minimo < 0 ? minimo : 0;
  };

  const calcularPosicaoY = (valor, max, min) => {
    const range = max - min;
    const posicao = ((max - valor) / range) * 100;
    return Math.max(0, Math.min(100, posicao));
  };

  const calcularPosicaoX = (index, total) => {
    return (index / (total - 1)) * 100;
  };

  const gerarCaminhoLinha = (dados, propriedade, max, min) => {
    if (dados.length === 0) return '';
    
    const pontos = dados.map((item, index) => {
      const x = calcularPosicaoX(index, dados.length);
      const y = calcularPosicaoY(item[propriedade], max, min);
      return `${x},${y}`;
    });

    return `M ${pontos.join(' L ')}`;
  };

  const variacao = calcularVariacao();
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
            <p className="text-sm text-gray-600">Receitas x Despesas x Lucro</p>
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
            <p className="text-sm text-gray-600">Últimos {historico.length} meses</p>
          </div>
        </div>

        {/* Variação do último mês */}
        {variacao && (
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">vs {variacao.mesAnterior}</p>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                variacao.receita >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {variacao.receita >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(variacao.receita).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
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

            {/* Linha de Despesas (vermelha) */}
            <path
              d={gerarCaminhoLinha(historico, 'despesas', valorMaximo, valorMinimo)}
              fill="none"
              stroke="url(#gradientDespesas)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Linha de Receita (verde) */}
            <path
              d={gerarCaminhoLinha(historico, 'receita', valorMaximo, valorMinimo)}
              fill="none"
              stroke="url(#gradientReceita)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Linha de Lucro (azul) */}
            <path
              d={gerarCaminhoLinha(historico, 'lucro', valorMaximo, valorMinimo)}
              fill="none"
              stroke="url(#gradientLucro)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Pontos na linha de Receita */}
            {historico.map((item, index) => {
              const x = calcularPosicaoX(index, historico.length);
              const y = calcularPosicaoY(item.receita, valorMaximo, valorMinimo);
              return (
                <g key={`receita-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="1.2"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="0.3"
                    className="cursor-pointer hover:r-2 transition-all"
                  />
                  {/* Tooltip */}
                  <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <rect
                      x={x - 8}
                      y={y - 8}
                      width="16"
                      height="6"
                      fill="#1f2937"
                      rx="1"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      fontSize="2.5"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {formatMoney(item.receita)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Pontos na linha de Despesas */}
            {historico.map((item, index) => {
              const x = calcularPosicaoX(index, historico.length);
              const y = calcularPosicaoY(item.despesas, valorMaximo, valorMinimo);
              return (
                <g key={`despesas-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="1.2"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="0.3"
                    className="cursor-pointer hover:r-2 transition-all"
                  />
                  {/* Tooltip */}
                  <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <rect
                      x={x - 8}
                      y={y - 8}
                      width="16"
                      height="6"
                      fill="#1f2937"
                      rx="1"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      fontSize="2.5"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {formatMoney(item.despesas)}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Pontos na linha de Lucro */}
            {historico.map((item, index) => {
              const x = calcularPosicaoX(index, historico.length);
              const y = calcularPosicaoY(item.lucro, valorMaximo, valorMinimo);
              return (
                <g key={`lucro-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="1.2"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="0.3"
                    className="cursor-pointer hover:r-2 transition-all"
                  />
                  {/* Tooltip */}
                  <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                    <rect
                      x={x - 8}
                      y={y - 8}
                      width="16"
                      height="6"
                      fill="#1f2937"
                      rx="1"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      fontSize="2.5"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {formatMoney(item.lucro)}
                    </text>
                  </g>
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
              <linearGradient id="gradientLucro" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels do Eixo X (meses) */}
          <div className="flex justify-between mt-3 px-1">
            {historico.map((mes, index) => (
              <div key={index} className="text-xs font-semibold text-gray-600 uppercase text-center flex-1">
                {mes.mesNome}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-8 mt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Receita</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Despesas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Lucro</span>
        </div>
      </div>

      {/* Cards de Resumo do Último Mês */}
      {variacao && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Receita</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
              variacao.receita >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {variacao.receita >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {variacao.receita >= 0 ? '+' : ''}{variacao.receita.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Despesas</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
              variacao.despesas <= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {variacao.despesas >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {variacao.despesas >= 0 ? '+' : ''}{variacao.despesas.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Lucro</p>
            <p className={`text-lg font-bold flex items-center justify-center gap-1 ${
              variacao.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {variacao.lucro >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {variacao.lucro >= 0 ? '+' : ''}{variacao.lucro.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficoEvolucaoMensal;
