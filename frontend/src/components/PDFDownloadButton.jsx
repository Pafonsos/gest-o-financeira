import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import axios from 'axios';

export const PDFDownloadButton = ({ clienteId, tipo = 'cliente' }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      let url = '';
      let filename = '';

      if (tipo === 'cliente') {
        url = `/api/pdf/cliente/${clienteId}`;
        filename = `relatorio_cliente_${clienteId}.pdf`;
      } else if (tipo === 'mensal') {
        const hoje = new Date();
        const mes = hoje.getMonth() + 1;
        const ano = hoje.getFullYear();
        url = `/api/pdf/mensal/${ano}/${mes}`;
        filename = `relatorio_mensal_${mes}_${ano}.pdf`;
      }

      const response = await axios.get(url, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Baixar PDF
        </>
      )}
    </button>
  );
};
