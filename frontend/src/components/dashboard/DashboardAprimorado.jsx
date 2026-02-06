import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, AlertCircle, Calendar, Clock, CheckCircle, BarChart3, Briefcase, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, Edit2, Plus, Trash2, X, Save, Download, Activity } from 'lucide-react';
import GraficoEvolucaoMensal from './GraficoEvolucaoMensal';

const DashboardFinanceiro = ({ clientes = [] }) => {
  const [periodo, setPeriodo] = useState('mes');
  const [modalDespesas, setModalDespesas] = useState(false);
  const [modalMeta, setModalMeta] = useState(false);
  
  // Despesas editáveis (salvos no localStorage)
  const [despesas, setDespesas] = useState(() => {
    const salvas = localStorage.getItem('dashboard-despesas');
    return salvas ? JSON.parse(salvas) : [
      { categoria: 'Folha de Pagamento', valor: 45000, tipo: 'fixa' },
      { categoria: 'Aluguel/Infraestrutura', valor: 8000, tipo: 'fixa' },
      { categoria: 'Equipamentos', valor: 5000, tipo: 'variavel' },
      { categoria: 'Marketing', valor: 3000, tipo: 'variavel' },
      { categoria: 'Impostos', valor: 12000, tipo: 'fixa' },
      { categoria: 'Outros', valor: 4000, tipo: 'variavel' }
    ];
  });

  // Meta mensal editável
  const [metaMensal, setMetaMensal] = useState(() => {
    const salva = localStorage.getItem('dashboard-meta-mensal');
    return salva ? parseFloat(salva) : 100000;
  });

  const [novaDespesa, setNovaDespesa] = useState({
    categoria: '',
    valor: '',
    tipo: 'fixa'
  });

  // Estado para edição de despesa
  const [editandoDespesa, setEditandoDespesa] = useState(null);

  // Funções para gerenciar despesas
  const adicionarDespesa = () => {
    if (novaDespesa.categoria && novaDespesa.valor) {
      // Converte string de centavos para número
      const valorNumerico = parseFloat(novaDespesa.valor) / 100;
      setDespesas([...despesas, { ...novaDespesa, valor: valorNumerico }]);
      setNovaDespesa({ categoria: '', valor: '', tipo: 'fixa' });
    }
  };

  const editarDespesa = (index) => {
    setEditandoDespesa(index);
    
    // Se o valor for 0, armazena como string "0"
    const valorEmCentavos = despesas[index].valor === 0 
      ? '0' 
      : Math.round(despesas[index].valor * 100).toString();
      
    setNovaDespesa({ 
      ...despesas[index], 
      valor: valorEmCentavos 
    });
  };

  const salvarEdicaoDespesa = () => {
    if (novaDespesa.categoria && novaDespesa.valor) {
      const valorNumerico = parseFloat(novaDespesa.valor) / 100;
      const novasDespesas = [...despesas];
      novasDespesas[editandoDespesa] = { 
        ...novaDespesa, 
        valor: valorNumerico 
      };
      setDespesas(novasDespesas);
      setEditandoDespesa(null);
      setNovaDespesa({ categoria: '', valor: '', tipo: 'fixa' });
    }
  };

  const removerDespesa = (index) => {
    setDespesas(despesas.filter((_, i) => i !== index));
  };

  const cancelarEdicao = () => {
    setEditandoDespesa(null);
    setNovaDespesa({ categoria: '', valor: '', tipo: 'fixa' });
  };

  // Salvar despesas no localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-despesas', JSON.stringify(despesas));
  }, [despesas]);

  // Salvar meta no localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-meta-mensal', metaMensal.toString());
  }, [metaMensal]);

  const [metricas, setMetricas] = useState({
    receitaRealizada: 0,
    receitaPrevista: 0,
    receitaPendente: 0,
    inadimplencia: 0,
    previsaoProximoMes: 0,
    despesasTotais: 0,
    lucroOperacional: 0,
    margemLucro: 0,
    fluxoCaixa: 0,
    clientesAtivos: 0,
    clientesInadimplentes: 0
  });


  const getPeriodoRange = useCallback(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    if (periodo === 'trimestre') {
      const trimestreInicio = Math.floor(mesAtual / 3) * 3;
      const inicio = new Date(anoAtual, trimestreInicio, 1);
      const fim = new Date(anoAtual, trimestreInicio + 3, 0, 23, 59, 59, 999);
      return { inicio, fim };
    }

    if (periodo === 'ano') {
      const inicio = new Date(anoAtual, 0, 1);
      const fim = new Date(anoAtual, 11, 31, 23, 59, 59, 999);
      return { inicio, fim };
    }

    const inicio = new Date(anoAtual, mesAtual, 1);
    const fim = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
    return { inicio, fim };
  }, [periodo]);

  const calcularMetricas = useCallback(() => {
    // Garantir que clientes é um array válido
    const clientesArray = Array.isArray(clientes) ? clientes : [];
    
    if (clientesArray.length === 0) {
      // Se não há clientes, zera tudo
      setMetricas({
        receitaRealizada: 0,
        receitaPrevista: 0,
        receitaPendente: 0,
        inadimplencia: 0,
        previsaoProximoMes: 0,
        despesasTotais: despesas.reduce((sum, d) => sum + d.valor, 0),
        lucroOperacional: 0,
        margemLucro: 0,
        fluxoCaixa: 0,
        clientesAtivos: 0,
        clientesInadimplentes: 0
      });
      return;
    }

    const hoje = new Date();
    const { inicio, fim } = getPeriodoRange();
    const isInRange = (data) => data && data >= inicio && data <= fim;

    // Receitas
    const receitaRealizada = clientesArray.reduce((sum, c) => {
      const pagamentos = Array.isArray(c.historicosPagamentos) ? c.historicosPagamentos : [];
      if (pagamentos.length > 0) {
        return sum + pagamentos.reduce((acc, p) => {
          const data = p.data ? new Date(p.data) : null;
          if (!data || Number.isNaN(data.getTime())) return acc;
          if (!isInRange(data)) return acc;
          return acc + (Number(p.valor) || 0);
        }, 0);
      }
      if (c.dataVenda) {
        const dataVenda = new Date(c.dataVenda);
        if (isInRange(dataVenda)) {
          return sum + (c.valorPago || 0);
        }
        return sum;
      }
      return sum + (c.valorPago || 0);
    }, 0);

    const receitaPrevista = clientesArray.reduce((sum, c) => {
      if (c.dataVenda) {
        const dataVenda = new Date(c.dataVenda);
        if (!Number.isNaN(dataVenda.getTime()) && isInRange(dataVenda)) {
          return sum + (c.valorTotal || 0);
        }
        return sum;
      }
      return sum + (c.valorTotal || 0);
    }, 0);
    const receitaPendente = receitaPrevista - receitaRealizada;

    // Inadimplência
    const totalAtrasado = clientesArray
      .filter(c => {
        if (!c.proximoVencimento) return false;
        const venc = new Date(c.proximoVencimento);
        if (Number.isNaN(venc.getTime())) return false;
        return venc < hoje && isInRange(venc) && c.valorPago < c.valorTotal;
      })
      .reduce((sum, c) => sum + (c.valorTotal - c.valorPago), 0);

    const inadimplencia = receitaPrevista > 0 ? (totalAtrasado / receitaPrevista) * 100 : 0;
    const clientesInadimplentes = clientesArray.filter(c => {
      if (!c.proximoVencimento) return false;
      const venc = new Date(c.proximoVencimento);
      if (Number.isNaN(venc.getTime())) return false;
      return venc < hoje && isInRange(venc) && c.valorPago < c.valorTotal;
    }).length;

    // Previsão próximo mês
    const proximoMes = new Date(fim.getFullYear(), fim.getMonth() + 1, 1);
    const fimProximoMes = new Date(fim.getFullYear(), fim.getMonth() + 2, 0);
    
    const previsaoProximoMes = clientesArray
      .filter(c => {
        if (!c.proximoVencimento || c.valorPago >= c.valorTotal) return false;
        const venc = new Date(c.proximoVencimento);
        return venc >= proximoMes && venc <= fimProximoMes;
      })
      .reduce((sum, c) => sum + (c.valorParcela || 0), 0);

    // Despesas
    const despesasTotais = despesas.reduce((sum, d) => {
      if (d.vencimento) {
        const venc = new Date(d.vencimento);
        if (!Number.isNaN(venc.getTime()) && isInRange(venc)) {
          return sum + (d.valor || 0);
        }
        return sum;
      }
      return sum + (d.valor || 0);
    }, 0);

    // Lucro e Margem
    const lucroOperacional = receitaRealizada - despesasTotais;
    const margemLucro = receitaRealizada > 0 ? (lucroOperacional / receitaRealizada) * 100 : 0;

    // Fluxo de Caixa
    const fluxoCaixa = lucroOperacional;

    // Clientes Ativos
    const clientesAtivos = clientesArray.filter(c => {
      if (c.valorPago > 0) return true;
      if (!c.proximoVencimento) return false;
      const venc = new Date(c.proximoVencimento);
      if (Number.isNaN(venc.getTime())) return false;
      return venc >= inicio && venc <= fim;
    }).length;

    setMetricas({
      receitaRealizada,
      receitaPrevista,
      receitaPendente,
      inadimplencia,
      previsaoProximoMes,
      despesasTotais,
      lucroOperacional,
      margemLucro,
      fluxoCaixa,
      clientesAtivos,
      clientesInadimplentes
    });
  }, [clientes, despesas, periodo, getPeriodoRange]);

  useEffect(() => {
    if (clientes) {
      calcularMetricas();
    }
  }, [clientes, despesas, periodo, calcularMetricas]);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatação de input que lida com zero
  const formatInputCurrency = (value) => {
    // Se for string vazia, retorna string vazia
    if (value === '') return '';
    
    // Converte para string e remove caracteres não numéricos
    const apenasNumeros = value.toString().replace(/\D/g, '');
    
    // Se não há números, retorna vazio
    if (apenasNumeros === '') return '';
    
    // Converte para número em centavos
    const numero = parseFloat(apenasNumeros) / 100;
    
    // Se for NaN ou zero, mostra R$ 0,00
    if (isNaN(numero) || numero === 0) return 'R$ 0,00';
    
    // Formata normalmente
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para exportar dados do dashboard
  const exportarDashboard = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const periodoTexto = periodo === 'mes' ? 'Mensal' : periodo === 'trimestre' ? 'Trimestral' : 'Anual';
    
    // Preparar dados das métricas
    const dadosMetricas = [
      ['Relatório Financeiro', periodoTexto, dataAtual],
      [''],
      ['MÉTRICAS PRINCIPAIS'],
      ['Receita Realizada', formatMoney(metricas.receitaRealizada)],
      ['Lucro Operacional', formatMoney(metricas.lucroOperacional)],
      ['Margem de Lucro', `${metricas.margemLucro.toFixed(2)}%`],
      ['Receita Pendente', formatMoney(metricas.receitaPendente)],
      ['Despesas Totais', formatMoney(metricas.despesasTotais)],
      [''],
      ['MÉTRICAS SECUNDÁRIAS'],
      ['Taxa de Inadimplência', `${metricas.inadimplencia.toFixed(2)}%`],
      ['Clientes Ativos', metricas.clientesAtivos.toString()],
      ['Clientes Inadimplentes', metricas.clientesInadimplentes.toString()],
      ['Previsão Próximo Mês', formatMoney(metricas.previsaoProximoMes)],
      ['Meta Mensal', formatMoney(metaMensal)],
      [''],
      ['DESPESAS DETALHADAS']
    ];

    // Adicionar cabeçalhos das despesas
    dadosMetricas.push(['Categoria', 'Valor', 'Tipo']);
    
    // Adicionar cada despesa
    despesas.forEach(despesa => {
      dadosMetricas.push([
        despesa.categoria,
        formatMoney(despesa.valor),
        despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'
      ]);
    });

    // Converter para CSV
    const csvContent = dadosMetricas
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Criar e baixar o arquivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-financeiro-${dataAtual.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar para Google Sheets
  const exportarParaGoogleSheets = async () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const periodoTexto = periodo === 'mes' ? 'Mensal' : periodo === 'trimestre' ? 'Trimestral' : 'Anual';
    
    // Preparar dados das métricas
    const dadosMetricas = [
      ['Relatório Financeiro', periodoTexto, dataAtual],
      [''],
      ['MÉTRICAS PRINCIPAIS'],
      ['Receita Realizada', formatMoney(metricas.receitaRealizada)],
      ['Lucro Operacional', formatMoney(metricas.lucroOperacional)],
      ['Margem de Lucro', `${metricas.margemLucro.toFixed(2)}%`],
      ['Receita Pendente', formatMoney(metricas.receitaPendente)],
      ['Despesas Totais', formatMoney(metricas.despesasTotais)],
      [''],
      ['MÉTRICAS SECUNDÁRIAS'],
      ['Taxa de Inadimplência', `${metricas.inadimplencia.toFixed(2)}%`],
      ['Clientes Ativos', metricas.clientesAtivos.toString()],
      ['Clientes Inadimplentes', metricas.clientesInadimplentes.toString()],
      ['Previsão Próximo Mês', formatMoney(metricas.previsaoProximoMes)],
      ['Meta Mensal', formatMoney(metaMensal)],
      [''],
      ['DESPESAS DETALHADAS'],
      ['Categoria', 'Valor', 'Tipo']
    ];

    // Adicionar cada despesa
    despesas.forEach(despesa => {
      dadosMetricas.push([
        despesa.categoria,
        formatMoney(despesa.valor),
        despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'
      ]);
    });

    // Converter para TSV (Tab Separated Values)
    const tsvContent = dadosMetricas
      .map(row => row.join('\t'))
      .join('\n');

    try {
      // Copiar para área de transferência
      await navigator.clipboard.writeText(tsvContent);
      
      // Abrir Google Sheets em nova aba
      window.open('https://docs.google.com/spreadsheets/create', '_blank');
      
      // Mostrar mensagem de instrução
      alert('✅ Dados copiados para a área de transferência!\n\n📋 No Google Sheets que acabou de abrir:\n1. Clique na célula A1\n2. Pressione Ctrl+V (ou Cmd+V no Mac) para colar os dados\n3. Os dados serão organizados automaticamente nas colunas');
    } catch (err) {
      console.error('Erro ao copiar dados:', err);
      alert('❌ Erro ao copiar dados. Tente novamente ou use a opção CSV.');
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, highlight }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ${highlight ? 'ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-50/50 to-white' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
            trend >= 0 
              ? 'text-emerald-700 bg-emerald-100' 
              : 'text-red-700 bg-red-100'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header com Logo e Filtros */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo-proteq-2.png" 
              alt="PROTEQ Logo" 
              className="h-12 w-auto filter brightness-0 invert"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Financeiro PROTEQ</h1>
              <p className="text-blue-100 text-sm">Sistema de Gestão Financeira Empresarial</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                periodo === 'mes' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border border-blue-400/30'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriodo('trimestre')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                periodo === 'trimestre' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border border-blue-400/30'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriodo('ano')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                periodo === 'ano' 
                  ? 'bg-white text-blue-700 shadow-md' 
                  : 'bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border border-blue-400/30'
              }`}
            >
              Ano
            </button>
            <div className="w-px h-8 bg-blue-400/30 mx-2"></div>
            <div className="flex gap-2">
              <button
                onClick={exportarDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Exportar dados para CSV"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportarParaGoogleSheets}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Abrir dados no Google Sheets"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0H5.272C3.512 0 2.08.7 2.08 2.182v19.636C2.08 23.3 3.512 24 5.272 24h14.456C21.488 24 22.92 23.3 22.92 21.818V7.636L14.728 0zm6.816 21.818c0 .4-.336.727-.752.727H5.272c-.416 0-.752-.327-.752-.727V2.182c0-.4.336-.727.752-.727h8.08v2.91c0 .4.336.727.752.727h2.912v16.727z"/>
                </svg>
                Sheets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Realizada"
          value={formatMoney(metricas.receitaRealizada)}
          subtitle={`${((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0).toFixed(1)}% do previsto`}
          icon={DollarSign}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          highlight
        />
        
        <MetricCard
          title="Lucro Operacional"
          value={formatMoney(metricas.lucroOperacional)}
          subtitle={`Margem: ${metricas.margemLucro.toFixed(1)}%`}
          icon={TrendingUp}
          color={metricas.lucroOperacional >= 0 ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" : "bg-gradient-to-br from-red-500 to-red-600 text-white"}
        />
        
        <MetricCard
          title="Receita Pendente"
          value={formatMoney(metricas.receitaPendente)}
          subtitle="A receber"
          icon={Clock}
          color="bg-gradient-to-br from-amber-500 to-orange-500 text-white"
        />
        
        <MetricCard
          title="Despesas Totais"
          value={formatMoney(metricas.despesasTotais)}
          subtitle="Mês atual"
          icon={CreditCard}
          color="bg-gradient-to-br from-slate-600 to-slate-700 text-white"
        />
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Taxa de Inadimplência"
          value={`${metricas.inadimplencia.toFixed(1)}%`}
          subtitle={`${metricas.clientesInadimplentes} clientes inadimplentes`}
          icon={AlertCircle}
          color={metricas.inadimplencia > 10 ? "bg-gradient-to-br from-red-500 to-red-600 text-white" : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"}
        />

        <MetricCard
          title="Clientes Ativos"
          value={metricas.clientesAtivos}
          subtitle="Com contratos vigentes"
          icon={Briefcase}
          color="bg-gradient-to-br from-teal-500 to-teal-600 text-white"
        />
      </div>

      {/* Linha 2: Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Caixa */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Fluxo de Caixa</h3>
              <p className="text-sm text-gray-600">Entradas vs Saídas</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Entradas</span>
                <span className="font-bold text-emerald-600">{formatMoney(metricas.receitaRealizada)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metricas.receitaRealizada / (metricas.receitaRealizada + metricas.despesasTotais)) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Saídas</span>
                <span className="font-bold text-red-600">{formatMoney(metricas.despesasTotais)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metricas.despesasTotais / (metricas.receitaRealizada + metricas.despesasTotais)) * 100, 100)}%` }} 
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Saldo Final</span>
                <span className={`text-xl font-bold ${metricas.fluxoCaixa >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatMoney(metricas.fluxoCaixa)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Previsão Próximo Mês */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">Previsão Próximo Mês</h3>
                <p className="text-sm text-blue-700">Receita prevista com vencimentos</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-900 mb-2">
                {formatMoney(metricas.previsaoProximoMes)}
              </p>
              <p className="text-sm text-blue-700 font-medium">
                Receita projetada
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-blue-800">Meta Mensal</p>
                <button
                  onClick={() => setModalMeta(true)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-lg hover:bg-blue-100"
                  title="Editar meta"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xl font-bold text-blue-900 mb-3">{formatMoney(metaMensal)}</p>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min((metricas.receitaRealizada / metaMensal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2 font-medium">
                {((metricas.receitaRealizada / metaMensal) * 100).toFixed(1)}% atingido
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receitas Pendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-xl border border-orange-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900">Receitas Pendentes</h3>
                <p className="text-sm text-orange-700">Pagamentos aguardando recebimento</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-orange-900 mb-2">
                {formatMoney(metricas.receitaPendente)}
              </p>
              <p className="text-sm text-orange-700 font-medium">
                Valor total pendente
              </p>
            </div>
            <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-orange-800">Próximos Vencimentos</p>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                  {metricas.clientesInadimplentes} itens
                </span>
              </div>
              <div className="space-y-2">
                {clientes.filter(c => c.valorPago < c.valorTotal).slice(0, 3).map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-orange-50/50 rounded-lg border border-orange-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-900">{cliente.nome}</p>
                      <p className="text-xs text-orange-700">{cliente.servico || 'Serviço'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-900">{formatMoney(cliente.valorTotal - cliente.valorPago)}</p>
                      <p className="text-xs text-orange-700">
                        {cliente.proximoVencimento ? new Date(cliente.proximoVencimento).toLocaleDateString('pt-BR') : 'Data não definida'}
                      </p>
                    </div>
                  </div>
                ))}
                {clientes.filter(c => c.valorPago < c.valorTotal).length === 0 && (
                  <p className="text-sm text-orange-600 text-center py-4">Nenhum pagamento pendente</p>
                )}
              </div>
            </div>
          </div>
        </div>
       
        {/* Distribuição de Despesas */}
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-6 rounded-xl border border-slate-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Distribuição de Despesas</h3>
                <p className="text-sm text-slate-700">Análise detalhada dos custos</p>
              </div>
            </div>
            <button
              onClick={() => setModalDespesas(true)}
              className="flex items-center gap-2 text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          </div>
          <div className="space-y-4">
            {despesas.length > 0 ? despesas.map((despesa, index) => (
              <div key={index} className="bg-white/70 rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{despesa.categoria}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full font-medium ${
                      despesa.tipo === 'fixa' 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatMoney(despesa.valor)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden text-gray-900">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                      despesa.tipo === 'fixa' ? 'bg-gradient-to-r from-slate-500 to-slate-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${(despesa.valor / metricas.despesasTotais) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  {((despesa.valor / metricas.despesasTotais) * 100).toFixed(1)}% do total
                </p>
              </div>
            )) : (
              <div className="bg-white/70 rounded-xl p-8 text-center shadow-sm border border-slate-100">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Nenhuma despesa cadastrada</p>
                <p className="text-sm text-slate-500 mt-1">Adicione despesas para visualizar a distribuição</p>
              </div>
            )}
          </div>
        </div>

        {/* Saúde Financeira */}
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 rounded-xl border border-emerald-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Indicadores de Saúde</h3>
                <p className="text-sm text-emerald-700">Análise da saúde financeira</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-emerald-800">Margem de Lucro</span>
                <span className="text-lg font-bold text-emerald-900">{metricas.margemLucro.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                    metricas.margemLucro >= 20 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 
                    metricas.margemLucro >= 10 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${Math.min(Math.abs(metricas.margemLucro) * 2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-emerald-700 font-medium">
                  {metricas.margemLucro >= 20 ? 'Excelente' : metricas.margemLucro >= 10 ? 'Boa' : 'Atenção'}
                </p>
                <p className="text-xs text-emerald-600">Meta: ≥20%</p>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-emerald-800">Taxa de Recebimento</span>
                <span className="text-lg font-bold text-emerald-900">
                  {((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${(metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-emerald-700 font-medium">
                  {((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0) >= 90 ? 'Excelente' : 
                   ((metricas.receitaRealizada / metricas.receitaPrevista) * 100 || 0) >= 75 ? 'Boa' : 'Atenção'}
                </p>
                <p className="text-xs text-emerald-600">Meta: ≥90%</p>
              </div>
            </div>

            <div className="bg-white/70 rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-emerald-800">Inadimplência</span>
                <span className="text-lg font-bold text-emerald-900">{metricas.inadimplencia.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                    metricas.inadimplencia > 10 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                    'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  }`}
                  style={{ width: `${Math.min(metricas.inadimplencia * 5, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-emerald-700 font-medium">
                  {metricas.inadimplencia > 10 ? 'Atenção' : 'Controlada'}
                </p>
                <p className="text-xs text-emerald-600">Meta: ≤10%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-200">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  metricas.margemLucro >= 15 && metricas.inadimplencia < 10
                    ? 'bg-emerald-500'
                    : 'bg-yellow-500'
                }`}></div>
                <span className={`text-sm font-semibold ${
                  metricas.margemLucro >= 15 && metricas.inadimplencia < 10
                    ? 'text-emerald-700'
                    : 'text-yellow-700'
                }`}>
                  {metricas.margemLucro >= 15 && metricas.inadimplencia < 10
                    ? 'Empresa financeiramente saudável'
                    : 'Atenção aos indicadores'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GraficoEvolucaoMensal clientes={clientes} despesas={despesas} />
      {/* Alertas e Recomendações */}
      <div className="space-y-4">
        {metricas.inadimplencia > 10 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-bold mb-1">Alta Taxa de Inadimplência</h4>
                <p className="text-red-700 text-sm">
                  {metricas.clientesInadimplentes} clientes com pagamentos atrasados. Recomenda-se intensificar a cobrança usando o sistema de email marketing.
                </p>
              </div>
            </div>
          </div>
        )}

        {metricas.margemLucro < 10 && metricas.receitaRealizada > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-800 font-bold mb-1">Margem de Lucro Baixa</h4>
                <p className="text-yellow-700 text-sm">
                  Margem atual de {metricas.margemLucro.toFixed(1)}%. Considere revisar preços dos serviços ou reduzir custos operacionais.
                </p>
              </div>
            </div>
          </div>
        )}

        {metricas.lucroOperacional > 0 && metricas.inadimplencia < 10 && metricas.margemLucro >= 15 && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-green-800 font-bold mb-1">Desempenho Excelente</h4>
                <p className="text-green-700 text-sm">
                  Seus indicadores financeiros estão saudáveis. Continue monitorando e considere expansão de serviços.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar despesas */}
      {modalDespesas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Gerenciar Despesas</h3>
              <button
                onClick={() => setModalDespesas(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulário para adicionar/editar */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={novaDespesa.categoria}
                  onChange={(e) => setNovaDespesa({...novaDespesa, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: Aluguel, Marketing..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1  ">
                  Valor (R$)
                </label>
                <input
                  type="text"
                  value={formatInputCurrency(novaDespesa.valor)}
                  onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, '');
                    valor = valor.substring(0, 10);
                    
                    // Permite que o usuário digite apenas "0"
                    if (valor === '') {
                      setNovaDespesa({...novaDespesa, valor: ''});
                    } else if (valor === '0') {
                      setNovaDespesa({...novaDespesa, valor: '0'});
                    } else {
                      // Remove zeros à esquerda (exceto se for "0")
                      valor = valor.replace(/^0+/, '');
                      setNovaDespesa({...novaDespesa, valor: valor});
                    }
                  }}
                  onKeyDown={(e) => {
                    // Permite apagar completamente o campo
                    if (e.key === 'Backspace' && novaDespesa.valor === '0') {
                      setNovaDespesa({...novaDespesa, valor: ''});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={novaDespesa.tipo}
                  onChange={(e) => setNovaDespesa({...novaDespesa, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="fixa">Fixa</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
              <div className="flex gap-2">
                {editandoDespesa !== null ? (
                  <>
                    <button
                      onClick={salvarEdicaoDespesa}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Salvar
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={adicionarDespesa}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Adicionar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de despesas */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 mb-2">Despesas Cadastradas</h4>
              {despesas.map((despesa, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{despesa.categoria}</p>
                    <p className="text-sm text-gray-600">
                      {formatMoney(despesa.valor)} • {despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editarDespesa(index)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removerDespesa(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar meta */}
      {modalMeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Meta Mensal</h3>
              <button
                onClick={() => setModalMeta(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Mensal (R$)
                </label>
                <input
                  type="text"
                  value={metaMensal === 0 ? 'R$ 0,00' : formatInputCurrency(Math.round(metaMensal * 100).toString())}
                  onChange={(e) => {
                    let valor = e.target.value.replace(/\D/g, '');
                    valor = valor.substring(0, 10);
                    
                    if (valor === '') {
                      setMetaMensal(0);
                    } else if (valor === '0') {
                      setMetaMensal(0);
                    } else {
                      // Remove zeros à esquerda e converte para número
                      valor = valor.replace(/^0+/, '');
                      setMetaMensal(parseFloat(valor) / 100);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex gap-2 ">
                <button
                  onClick={() => setModalMeta(false)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Salvar
                </button>
                <button
                  onClick={() => setModalMeta(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFinanceiro;
