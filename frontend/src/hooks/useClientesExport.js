import { useCallback, useState } from 'react';
import { criarLinhaRelatorioCSV, criarLinhaRelatorioSheets } from '../utils/clientReports';

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/create?usp=sharing';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const useClientesExport = ({
  clientes,
  clientesFiltrados,
  calcularStatus,
  calcularDiasAtraso,
  getStatusText,
  formatarMoeda,
  showMessage
}) => {
  const [exportLoading, setExportLoading] = useState({
    csv: false,
    pdf: false,
    sheets: false
  });

  const setLoading = useCallback((field, value) => {
    setExportLoading((prev) => ({ ...prev, [field]: value }));
  }, []);

  const exportarRelatorio = useCallback(() => {
    setLoading('csv', true);
    try {
      if (!clientes || clientes.length === 0) {
        console.error('Exportação cancelada: lista de clientes vazia');
        showMessage({
          title: 'Sem dados',
          message: 'Não há clientes para exportar no momento.',
          type: 'warning'
        });
        return;
      }

      const relatorio = clientes.map((cliente) => {
        const status = calcularStatus(cliente);
        const statusText = getStatusText(status);
        const diasAtraso = status === 'em_atraso'
          ? calcularDiasAtraso(cliente.proximoVencimento)
          : 0;
        return criarLinhaRelatorioCSV(cliente, statusText, diasAtraso);
      });

      if (!relatorio || relatorio.length === 0 || !relatorio[0]) {
        console.error('Exportação cancelada: relatório vazio ou inválido', { relatorio });
        showMessage({
          title: 'Relatório inválido',
          message: 'Não foi possível gerar o relatório. Tente novamente.',
          type: 'error'
        });
        return;
      }

      const headers = Object.keys(relatorio[0]).filter((key) => key && key.trim().length > 0);
      if (headers.length === 0) {
        console.error('Exportação cancelada: nenhum cabeçalho detectado no relatório', { relatorio });
        showMessage({
          title: 'Relatório inválido',
          message: 'Nenhum cabeçalho encontrado para exportação.',
          type: 'error'
        });
        return;
      }

      const csvContent = [
        headers.join(';'),
        ...relatorio.map((row) =>
          Object.values(row)
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(';')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showMessage({
        title: 'Relatório exportado',
        message: 'O arquivo pode ser aberto no Excel ou Google Sheets.',
        type: 'success'
      });
    } finally {
      setLoading('csv', false);
    }
  }, [clientes, calcularStatus, getStatusText, calcularDiasAtraso, setLoading, showMessage]);

  const exportarClientesPDF = useCallback(() => {
    setLoading('pdf', true);
    const dados = Array.isArray(clientesFiltrados) ? clientesFiltrados : [];
    if (dados.length === 0) {
      showMessage({
        title: 'Sem dados',
        message: 'Não há clientes para exportar em PDF.',
        type: 'warning'
      });
      setLoading('pdf', false);
      return;
    }

    const janela = window.open('', '_blank', 'width=1200,height=800');
    if (!janela) {
      showMessage({
        title: 'Pop-up bloqueado',
        message: 'Permita pop-ups para exportar o PDF.',
        type: 'warning'
      });
      setLoading('pdf', false);
      return;
    }

    janela.document.write(`
      <html>
        <head>
          <title>Preparando PDF...</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          </style>
        </head>
        <body>
          <p>Gerando relatório, aguarde...</p>
        </body>
      </html>
    `);
    janela.document.close();

    const montarRelatorio = () => {
      const linhas = dados
        .map((cliente) => {
          const statusCalculado = calcularStatus(cliente);
          const status = statusCalculado === 'pago'
            ? 'Pago'
            : statusCalculado === 'em_atraso'
            ? 'Em Atraso'
            : 'Pendente';
          const restante = (cliente.valorTotal || 0) - (cliente.valorPago || 0);

          return `
            <tr>
              <td>${escapeHtml(cliente.nomeResponsavel)}</td>
              <td>${escapeHtml(cliente.nomeEmpresa)}</td>
              <td>${escapeHtml(cliente.email || '-')}</td>
              <td>${escapeHtml(cliente.telefone || '-')}</td>
              <td>${escapeHtml(formatarMoeda(cliente.valorTotal || 0))}</td>
              <td>${escapeHtml(formatarMoeda(restante))}</td>
              <td>${escapeHtml(status)}</td>
            </tr>
          `;
        })
        .join('');

      const data = new Date().toLocaleString('pt-BR');
      janela.document.open();
      janela.document.write(`
        <html>
          <head>
            <title>Relatório de Clientes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
              h1 { margin: 0 0 8px; font-size: 24px; }
              .meta { margin-bottom: 16px; color: #4b5563; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              th { background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>Relatório de Clientes</h1>
            <div class="meta">Gerado em: ${escapeHtml(data)} | Total: ${dados.length}</div>
            <table>
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Empresa</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Valor Total</th>
                  <th>Valor Restante</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${linhas}</tbody>
            </table>
          </body>
        </html>
      `);
      janela.document.close();
      setTimeout(() => {
        janela.focus();
        janela.print();
        setLoading('pdf', false);
      }, 80);
    };

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => setTimeout(montarRelatorio, 0));
      return;
    }
    setTimeout(montarRelatorio, 0);
  }, [clientesFiltrados, calcularStatus, formatarMoeda, setLoading, showMessage]);

  const exportarGoogleSheets = useCallback(() => {
    setLoading('sheets', true);
    const relatorio = clientes.map((cliente) => {
      const status = calcularStatus(cliente);
      const statusText = getStatusText(status);
      const diasAtraso = status === 'em_atraso'
        ? calcularDiasAtraso(cliente.proximoVencimento)
        : 0;
      return criarLinhaRelatorioSheets(cliente, statusText, diasAtraso);
    });

    navigator.clipboard
      .writeText(relatorio.map((row) => Object.values(row).join('\t')).join('\n'))
      .then(() => {
        window.open(GOOGLE_SHEETS_URL, '_blank');
        showMessage({
          title: 'Dados copiados',
          message: 'A planilha foi aberta. Clique na célula A1 e cole (Ctrl+V/Cmd+V).',
          type: 'success'
        });
      })
      .catch(() => {
        window.open(GOOGLE_SHEETS_URL, '_blank');
        showMessage({
          title: 'Dados copiados',
          message: 'A planilha foi aberta. Clique na célula A1 e cole (Ctrl+V/Cmd+V).',
          type: 'success'
        });
      })
      .finally(() => {
        setLoading('sheets', false);
      });
  }, [clientes, calcularStatus, getStatusText, calcularDiasAtraso, setLoading, showMessage]);

  return {
    exportarRelatorio,
    exportarClientesPDF,
    exportarGoogleSheets,
    exportLoading
  };
};
