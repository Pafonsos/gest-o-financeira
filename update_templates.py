#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

# Template CSS
css = """    * { margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      background-color: #f9f9f9;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: #ffffff; 
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e8e8e8;
    }
    .header { 
      background: #ffffff; 
      padding: 30px 40px;
      text-align: center;
      border-bottom: 1px solid #e8e8e8;
    }
    .logo { 
      max-width: 180px; 
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .content { 
      padding: 40px;
    }
    .greeting { 
      font-size: 16px;
      color: #333;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .greeting strong { 
      color: #2c3e50;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.7;
      color: #555;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f5f5f5;
      border-left: 3px solid #3498db;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #555;
    }
    .info-box strong {
      color: #2c3e50;
    }
    .details {
      background: #fafafa;
      padding: 20px;
      border-radius: 4px;
      margin: 24px 0;
      border: 1px solid #e8e8e8;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
      border-bottom: 1px solid #e8e8e8;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #666;
      font-weight: 500;
    }
    .detail-value {
      color: #2c3e50;
      font-weight: 600;
      text-align: right;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 12px 32px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s;
    }
    .button:hover {
      background: #2980b9;
    }
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #2c3e50;
      margin-top: 28px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e8e8;
    }
    .contact-info {
      background: #fafafa;
      padding: 16px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 14px;
      color: #555;
      border: 1px solid #e8e8e8;
    }
    .contact-info p {
      margin: 8px 0;
    }
    .contact-info strong {
      color: #2c3e50;
    }
    .divider {
      border: none;
      border-top: 1px solid #e8e8e8;
      margin: 28px 0;
    }
    .footer {
      background: #fafafa;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #e8e8e8;
    }
    .footer-logo {
      max-width: 120px;
      height: auto;
      display: block;
      margin: 0 auto 12px;
    }
    .signature {
      font-size: 14px;
      line-height: 1.6;
      color: #555;
      margin: 28px 0;
    }
    .signature strong {
      color: #2c3e50;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .content, .footer { padding: 20px; }
      .logo { max-width: 140px; }
      .detail-row { flex-direction: column; gap: 4px; }
      .detail-value { text-align: left; }
    }"""

# Template structure
def create_template(body_text):
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificação de Cobrança</title>
    <style>
{css}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="cid:logo-company" alt="Logo Empresa" class="logo">
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Prezado <strong>{{cliente_nome}}</strong>,
            </div>

            <div class="body-text">
{body_text}
            </div>

            <!-- Detalhes da Cobrança -->
            <div class="details">
                <div class="detail-row">
                    <span class="detail-label">Empresa:</span>
                    <span class="detail-value">{{empresa_nome}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">CNPJ:</span>
                    <span class="detail-value">{{empresa_cnpj}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Valor:</span>
                    <span class="detail-value">{{valor_formato}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Parcelas:</span>
                    <span class="detail-value">{{parcelas}}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Vencimento:</span>
                    <span class="detail-value">{{data_vencimento}}</span>
                </div>
            </div>

            <!-- Botão de Ação -->
            <div class="button-container">
                <a href="{{link_pagamento}}" class="button">Regularizar Pagamento</a>
            </div>

            <!-- Seção de Contato -->
            <div class="section-title">Dúvidas?</div>
            <div class="contact-info">
                <p>Caso tenha dúvidas sobre este pagamento, entre em contato conosco:</p>
                <p><strong>Email:</strong> contato@empresa.com.br</p>
                <p><strong>Telefone:</strong> (XX) XXXXX-XXXX</p>
            </div>

            <div class="signature">
                Atenciosamente,<br>
                <strong>{{empresa_nome}}</strong>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <img src="cid:logo-company" alt="Logo" class="footer-logo">
            <p>Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
            <p>&copy; {{ano}} {{empresa_nome}}. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>"""

# Templates específicos
templates = {
    'primeira-cobranca.html': """Este é o primeiro aviso referente a um pagamento pendente em sua conta.
                Para evitar problemas com seu cadastro, solicitamos que regularize o pagamento assim que possível.
                A falta de pagamento pode resultar em restrições futuras ao acesso dos nossos serviços.""",
    
    'cobranca-7dias.html': """Informamos que o prazo para pagamento está se encerrando. Faltam apenas 7 dias para o vencimento.
                Pedimos que realize o pagamento no prazo estabelecido para evitar possíveis pendências.
                Qualquer dúvida, não hesite em nos contatar.""",
    
    'cobranca-15dias.html': """Este é um aviso urgente: sua cobrança está com 15 dias de atraso.
                Solicitamos atenção imediata para regularização desta pendência.
                Atrasos podem prejudicar sua reputação e resultar em restrições de serviços.""",
    
    'cobranca-30dias.html': """AVISO CRÍTICO: Sua cobrança está com 30 dias de atraso.
                Esta é uma notificação de urgência máxima. Procure regularizar este pagamento imediatamente.
                Caso não haja regularização nos próximos dias, medidas adicionais podem ser tomadas.
                Contate-nos imediatamente para discutir opções de parcelamento ou negociação.""",
    
    'solicitacao-contato.html': """Recebemos sua solicitação de contato. Agradecemos o interesse em nossos serviços.
                Nossa equipe analisará sua mensagem e retornaremos em breve com mais informações.
                Fique atento à sua caixa de entrada e à pasta de spam para não perder nossa resposta."""
}

# Criar templates
template_dir = r'c:\Users\afonso\Desktop\faculdade\backend\templates'

for filename, body_text in templates.items():
    filepath = os.path.join(template_dir, filename)
    content = create_template(body_text)
    
    # Backup do arquivo antigo
    backup_path = filepath + '.backup'
    if os.path.exists(filepath) and not os.path.exists(backup_path):
        with open(filepath, 'r', encoding='utf-8') as f:
            backup_content = f.read()
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(backup_content)
        print(f"✅ Backup criado: {filename}.backup")
    
    # Escrever novo arquivo
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Template atualizado: {filename}")

print("\n✨ Todos os 5 templates foram atualizados com sucesso!")
print("✨ Novos templates: design limpo, logo customizável (cid:logo-company), profissional!")
