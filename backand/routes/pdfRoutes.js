const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');

// Gerar relatório de cliente
router.get('/cliente/:clienteId', authenticate, async (req, res) => {
  try {
    const { clienteId } = req.params;
    const userId = req.user.id;

    const filePath = await pdfService.generateClientReport(userId, clienteId);

    res.download(filePath, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
      }
      // Deletar arquivo temporário após download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório',
      error: error.message
    });
  }
});

// Gerar relatório mensal
router.get('/mensal/:ano/:mes', authenticate, async (req, res) => {
  try {
    const { ano, mes } = req.params;
    const userId = req.user.id;

    const filePath = await pdfService.generateMonthlyReport(
      userId,
      parseInt(mes),
      parseInt(ano)
    );

    res.download(filePath, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
      }
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório mensal',
      error: error.message
    });
  }
});

module.exports = router;

// -------------------- FRONTEND - BOTÃO DE DOWNLOAD --------------------
// src/components/PDFDownloadButton.js
import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
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

      // Criar link de download
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