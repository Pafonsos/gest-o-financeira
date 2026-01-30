const sendEmails = async () => {
  if (!selectedTemplate || selectedClients.length === 0) {
    alert('Selecione o template e os clientes.');
    return;
  }

  setLoading(true);
  try {
    // Verifica permissões de todos os clientes selecionados em paralelo
    const permissions = await Promise.all(
      selectedClients.map(async (id) => {
        const { canSend } = await emailSettingsService.canSendEmailToClient(id, selectedTemplate);
        return { id, canSend };
      })
    );

    const allowedIds = permissions.filter(p => p.canSend).map(p => p.id);
    const recipients = allowedIds.map(id => {
      const cliente = clientes.find(c => c.id === id);
      return {
        email: cliente.email,
        nomeResponsavel: cliente.nomeResponsavel || 'Responsável',
        nomeEmpresa: cliente.nomeEmpresa,
        // Garanta que os nomes das propriedades batam com o que o Backend/Joi espera
        valorPendente: (cliente.valorTotal - (cliente.valorPago || 0)).toFixed(2),
        parcelasAtraso: calcularParcelasEmAtraso(cliente).toString()
      };
    });

    if (recipients.length === 0) {
      alert('Nenhum cliente selecionado pode receber este e-mail (regras de exceção).');
      setLoading(false);
      return;
    }

    await emailService.sendBulkEmails({
      recipients,
      subject,
      template: selectedTemplate
    });

    alert(`Sucesso! ${recipients.length} e-mails enviados.`);
    setSelectedClients([]);
    loadStatistics();
  } catch (error) {
    alert('Erro: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};