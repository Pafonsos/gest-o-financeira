const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabaseClient');

class PDFService {
  async generateClientReport(userId, clienteId, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Buscar dados do cliente e pagamentos
        const { data: cliente, error: clienteError } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', clienteId)
          .eq('user_id', userId)
          .single();

        if (clienteError) throw clienteError;

        const { data: pagamentos } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('data_pagamento', { ascending: false });

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        // Criar PDF
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          info: {
            Title: `Relatório - ${cliente.nome_empresa}`,
            Author: profile.empresa,
            Subject: 'Relatório Financeiro'
          }
        });

        const fileName = `relatorio_${clienteId}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '..', 'temp', fileName);

        // Garantir que a pasta temp existe
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Cores
        const primaryColor = '#3b82f6';
        const secondaryColor = '#64748b';
        const successColor = '#10b981';
        const dangerColor = '#ef4444';

        // CABEÇALHO
        doc
          .fillColor(primaryColor)
          .fontSize(24)
          .text(profile.empresa || 'Financial Manager', 50, 50)
          .fontSize(10)
          .fillColor(secondaryColor)
          .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 50, 80);

        // Linha separadora
        doc
          .moveTo(50, 100)
          .lineTo(545, 100)
          .strokeColor(primaryColor)
          .lineWidth(2)
          .stroke();

        // TÍTULO
        doc
          .moveDown(2)
          .fontSize(18)
          .fillColor('#000')
          .text('RELATÓRIO FINANCEIRO DO CLIENTE', { align: 'center' });

        doc.moveDown(1);

        // INFORMAÇÕES DO CLIENTE
        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .text('Informações do Cliente', 50, doc.y);

        doc.moveDown(0.5);

        const clienteInfoY = doc.y;
        const infoBoxHeight = 150;

        // Box de informações
        doc
          .rect(50, clienteInfoY, 495, infoBoxHeight)
          .fillAndStroke('#f8f9fa', '#e5e7eb');

        doc
          .fillColor('#000')
          .fontSize(11);

        const leftCol = 70;
        const rightCol = 320;
        let currentY = clienteInfoY + 20;
        const lineHeight = 20;

        // Coluna esquerda
        doc
          .font('Helvetica-Bold')
          .text('Empresa:', leftCol, currentY)
          .font('Helvetica')
          .text(cliente.nome_empresa, leftCol + 100, currentY);

        currentY += lineHeight;
        doc
          .font('Helvetica-Bold')
          .text('Responsável:', leftCol, currentY)
          .font('Helvetica')
          .text(cliente.nome_responsavel, leftCol + 100, currentY);

        currentY += lineHeight;
        doc
          .font('Helvetica-Bold')
          .text('Email:', leftCol, currentY)
          .font('Helvetica')
          .text(cliente.email || 'Não informado', leftCol + 100, currentY);

        currentY += lineHeight;
        doc
          .font('Helvetica-Bold')
          .text('Telefone:', leftCol, currentY)
          .font('Helvetica')
          .text(cliente.telefone || 'Não informado', leftCol + 100, currentY);

        // Coluna direita
        currentY = clienteInfoY + 20;
        doc
          .font('Helvetica-Bold')
          .text('Serviço:', rightCol, currentY)
          .font('Helvetica')
          .text(cliente.servico || 'Não informado', rightCol + 80, currentY);

        currentY += lineHeight;
        doc
          .font('Helvetica-Bold')
          .text('Data Venda:', rightCol, currentY)
          .font('Helvetica')
          .text(
            cliente.data_venda 
              ? new Date(cliente.data_venda).toLocaleDateString('pt-BR')
              : 'Não informado',
            rightCol + 80,
            currentY
          );

        currentY += lineHeight;
        doc
          .font('Helvetica-Bold')
          .text('Vencimento:', rightCol, currentY)
          .font('Helvetica')
          .text(
            cliente.proximo_vencimento
              ? new Date(cliente.proximo_vencimento).toLocaleDateString('pt-BR')
              : 'Não informado',
            rightCol + 80,
            currentY
          );

        // RESUMO FINANCEIRO
        doc.y = clienteInfoY + infoBoxHeight + 30;

        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .text('Resumo Financeiro', 50, doc.y);

        doc.moveDown(0.5);

        const resumoY = doc.y;
        const resumoHeight = 100;

        doc
          .rect(50, resumoY, 495, resumoHeight)
          .fillAndStroke('#f0f9ff', '#bfdbfe');

        const valorTotal = parseFloat(cliente.valor_total);
        const valorPago = parseFloat(cliente.valor_pago);
        const valorRestante = valorTotal - valorPago;
        const percentualPago = ((valorPago / valorTotal) * 100).toFixed(1);

        currentY = resumoY + 20;
        const valueSize = 16;
        const labelSize = 10;

        // Valor Total
        doc
          .fontSize(labelSize)
          .fillColor(secondaryColor)
          .text('Valor Total do Contrato', 70, currentY);
        doc
          .fontSize(valueSize)
          .fillColor('#000')
          .font('Helvetica-Bold')
          .text(`R$ ${valorTotal.toFixed(2).replace('.', ',')}`, 70, currentY + 15);

        // Valor Pago
        doc
          .fontSize(labelSize)
          .fillColor(secondaryColor)
          .font('Helvetica')
          .text('Valor Pago', 240, currentY);
        doc
          .fontSize(valueSize)
          .fillColor(successColor)
          .font('Helvetica-Bold')
          .text(`R$ ${valorPago.toFixed(2).replace('.', ',')}`, 240, currentY + 15);

        // Valor Restante
        doc
          .fontSize(labelSize)
          .fillColor(secondaryColor)
          .font('Helvetica')
          .text('Valor Restante', 410, currentY);
        doc
          .fontSize(valueSize)
          .fillColor(dangerColor)
          .font('Helvetica-Bold')
          .text(`R$ ${valorRestante.toFixed(2).replace('.', ',')}`, 410, currentY + 15);

        // Barra de progresso
        currentY += 50;
        const barWidth = 495 - 40;
        const barHeight = 20;
        const progressWidth = (barWidth * valorPago) / valorTotal;

        doc
          .rect(70, currentY, barWidth, barHeight)
          .fillAndStroke('#e5e7eb', '#cbd5e1');

        doc
          .rect(70, currentY, progressWidth, barHeight)
          .fill(successColor);

        doc
          .fontSize(9)
          .fillColor('#fff')
          .text(`${percentualPago}%`, 70 + progressWidth / 2 - 15, currentY + 5);

        // HISTÓRICO DE PAGAMENTOS
        doc.y = resumoY + resumoHeight + 30;

        doc
          .fontSize(14)
          .fillColor(primaryColor)
          .text('Histórico de Pagamentos', 50, doc.y);

        doc.moveDown(1);

        if (!pagamentos || pagamentos.length === 0) {
          doc
            .fontSize(10)
            .fillColor(secondaryColor)
            .text('Nenhum pagamento registrado.', 70, doc.y);
        } else {
          // Tabela de pagamentos
          const tableTop = doc.y;
          const tableHeaders = ['Data', 'Valor', 'Método', 'Descrição'];
          const colWidths = [100, 100, 100, 195];
          let tableX = 50;

          // Cabeçalho da tabela
          doc
            .rect(50, tableTop, 495, 25)
            .fill('#f1f5f9');

          doc
            .fontSize(10)
            .fillColor('#000')
            .font('Helvetica-Bold');

          tableHeaders.forEach((header, i) => {
            doc.text(header, tableX, tableTop + 8, {
              width: colWidths[i],
              align: 'left'
            });
            tableX += colWidths[i];
          });

          // Linhas da tabela
          let rowY = tableTop + 25;
          doc.font('Helvetica');

          pagamentos.forEach((pagamento, index) => {
            if (rowY > 700) {
              doc.addPage();
              rowY = 50;
            }

            const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
            doc.rect(50, rowY, 495, 30).fill(bgColor);

            doc.fillColor('#000');

            tableX = 50;
            const values = [
              new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR'),
              `R$ ${parseFloat(pagamento.valor).toFixed(2).replace('.', ',')}`,
              pagamento.metodo_pagamento || '-',
              pagamento.descricao || '-'
            ];

            values.forEach((value, i) => {
              doc.text(value, tableX, rowY + 8, {
                width: colWidths[i],
                align: 'left'
              });
              tableX += colWidths[i];
            });

            rowY += 30;
          });

          // Borda da tabela
          doc
            .rect(50, tableTop, 495, rowY - tableTop)
            .stroke('#cbd5e1');
        }

        // RODAPÉ
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          
          doc
            .fontSize(8)
            .fillColor(secondaryColor)
            .text(
              `Página ${i + 1} de ${pageCount}`,
              50,
              doc.page.height - 50,
              { align: 'center' }
            );

          doc
            .text(
              'Este documento foi gerado automaticamente pelo Financial Manager',
              50,
              doc.page.height - 35,
              { align: 'center' }
            );
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async generateMonthlyReport(userId, mes, ano) {
    return new Promise(async (resolve, reject) => {
      try {
        // Buscar dados do período
        const inicioMes = new Date(ano, mes - 1, 1);
        const fimMes = new Date(ano, mes, 0);

        const { data: clientes } = await supabase
          .from('clientes')
          .select('*')
          .eq('user_id', userId);

        const { data: pagamentos } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('user_id', userId)
          .gte('data_pagamento', inicioMes.toISOString().split('T')[0])
          .lte('data_pagamento', fimMes.toISOString().split('T')[0]);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        // Calcular estatísticas
        const totalRecebido = pagamentos?.reduce((sum, p) => sum + parseFloat(p.valor), 0) || 0;
        const totalClientes = clientes?.length || 0;
        const clientesAtivos = clientes?.filter(c => c.status !== 'pago').length || 0;
        const clientesEmAtraso = clientes?.filter(c => c.status === 'em_atraso').length || 0;

        // Criar PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `relatorio_mensal_${mes}_${ano}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '..', 'temp', fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // CABEÇALHO
        doc
          .fillColor('#3b82f6')
          .fontSize(24)
          .text(profile.empresa || 'Financial Manager', 50, 50);

        doc
          .fontSize(16)
          .text(`Relatório Mensal - ${getMesNome(mes)}/${ano}`, 50, 85);

        doc
          .fontSize(10)
          .fillColor('#64748b')
          .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 50, 110);

        // Linha
        doc
          .moveTo(50, 130)
          .lineTo(545, 130)
          .strokeColor('#3b82f6')
          .lineWidth(2)
          .stroke();

        // CARDS DE RESUMO
        let cardY = 150;
        const cardData = [
          { label: 'Total Recebido', value: `R$ ${totalRecebido.toFixed(2).replace('.', ',')}`, color: '#10b981' },
          { label: 'Total de Clientes', value: totalClientes, color: '#3b82f6' },
          { label: 'Clientes Ativos', value: clientesAtivos, color: '#8b5cf6' },
          { label: 'Em Atraso', value: clientesEmAtraso, color: '#ef4444' }
        ];

        const cardWidth = 115;
        const cardHeight = 80;
        const cardSpacing = 10;

        cardData.forEach((card, index) => {
          const x = 50 + (index * (cardWidth + cardSpacing));
          
          doc
            .rect(x, cardY, cardWidth, cardHeight)
            .fillAndStroke('#f8f9fa', '#e5e7eb');

          doc
            .fontSize(10)
            .fillColor('#64748b')
            .text(card.label, x + 10, cardY + 15, { width: cardWidth - 20 });

          doc
            .fontSize(22)
            .fillColor(card.color)
            .font('Helvetica-Bold')
            .text(card.value, x + 10, cardY + 35, { width: cardWidth - 20 });
        });

        // LISTA DE PAGAMENTOS
        doc.y = cardY + cardHeight + 30;

        doc
          .fontSize(14)
          .fillColor('#3b82f6')
          .font('Helvetica')
          .text('Pagamentos do Período', 50, doc.y);

        doc.moveDown(1);

        if (!pagamentos || pagamentos.length === 0) {
          doc
            .fontSize(10)
            .fillColor('#64748b')
            .text('Nenhum pagamento neste período.', 70, doc.y);
        } else {
          // Tabela de pagamentos
          const tableTop = doc.y;
          const tableHeaders = ['Data', 'Cliente', 'Valor'];
          const colWidths = [100, 295, 100];
          let tableX = 50;

          // Cabeçalho
          doc
            .rect(50, tableTop, 495, 25)
            .fill('#f1f5f9');

          doc
            .fontSize(10)
            .fillColor('#000')
            .font('Helvetica-Bold');

          tableHeaders.forEach((header, i) => {
            doc.text(header, tableX, tableTop + 8, {
              width: colWidths[i],
              align: 'left'
            });
            tableX += colWidths[i];
          });

          // Linhas
          let rowY = tableTop + 25;
          doc.font('Helvetica');

          for (const pagamento of pagamentos) {
            if (rowY > 700) {
              doc.addPage();
              rowY = 50;
            }

            // Buscar nome do cliente
            const cliente = clientes.find(c => c.id === pagamento.cliente_id);

            doc.rect(50, rowY, 495, 30).fill('#ffffff');

            tableX = 50;
            const values = [
              new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR'),
              cliente?.nome_empresa || 'Cliente não encontrado',
              `R$ ${parseFloat(pagamento.valor).toFixed(2).replace('.', ',')}`
            ];

            values.forEach((value, i) => {
              doc.fillColor('#000').text(value, tableX, rowY + 8, {
                width: colWidths[i],
                align: 'left'
              });
              tableX += colWidths[i];
            });

            rowY += 30;
          }

          doc.rect(50, tableTop, 495, rowY - tableTop).stroke('#cbd5e1');
        }

        // RODAPÉ
        doc
          .fontSize(8)
          .fillColor('#64748b')
          .text(
            'Financial Manager - Relatório Automático',
            50,
            doc.page.height - 50,
            { align: 'center' }
          );

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

function getMesNome(mes) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
}

module.exports = new PDFService();