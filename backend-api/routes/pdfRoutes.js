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
