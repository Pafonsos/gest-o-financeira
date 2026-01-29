#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os

# Template CSS com fundo azul PROTEQ no header
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #1e5ba8 0%, #2a7cbd 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: none;
    }
    .logo { 
      max-width: 200px; 
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .content { 
      padding: 40px;
    }
    .greeting { 
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 24px;
      line-height: 1.6;
      font-weight: 500;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.8;
      color: #444;
      margin-bottom: 24px;
      text-align: justify;
    }
    .body-text strong {
      color: #1e5ba8;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: #1e5ba8;
      color: white;
      padding: 14px 36px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s;
    }
    .button:hover {
      background: #164380;
    }
    .contact-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e8e8e8;
    }
    .contact-label {
      font-size: 13px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .contact-info {
      font-size: 14px;
      color: #555;
      line-height: 1.8;
    }
    .contact-info p {
      margin: 6px 0;
    }
    .signature {
      font-size: 13px;
      line-height: 1.6;
      color: #666;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e8e8e8;
    }
    .signature strong {
      color: #1e5ba8;
      display: block;
      margin-top: 8px;
      font-size: 14px;
    }
    .footer {
      background: #fafafa;
      padding: 24px 30px;
      text-align: center;
      font-size: 11px;
      color: #888;
      border-top: 1px solid #e8e8e8;
    }
    .footer p {
      margin: 4px 0;
    }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .content, .footer { padding: 20px; }
      .logo { max-width: 160px; }
      .body-text { text-align: left; }
    }"""

# Templates específicos com texto corrido
templates = {
    'primeira-cobranca.html': """Prezado {{cliente_nome}},

Esperamos que esteja bem. Entramos em contato para informar sobre um pagamento pendente em sua conta junto à PROTEQ Jr. 

Você possui uma cobrança referente à {{empresa_nome}} (CNPJ: {{empresa_cnpj}}) no valor de <strong>{{valor_formato}}</strong>, dividida em <strong>{{parcelas}}</strong> parcelas, com vencimento em <strong>{{data_vencimento}}</strong>. 

Para que não haja problemas com seu cadastro, solicitamos que regularize o pagamento assim que possível. A falta de pagamento pode resultar em restrições futuras ao acesso dos nossos serviços.

Clique no botão abaixo para realizar o pagamento de forma rápida e segura.""",
    
    'cobranca-7dias.html': """Prezado {{cliente_nome}},

Informamos que o prazo para pagamento está se encerrando. Você possui uma cobrança referente à {{empresa_nome}} (CNPJ: {{empresa_cnpj}}) no valor de <strong>{{valor_formato}}</strong>, dividida em <strong>{{parcelas}}</strong> parcelas, e o vencimento é <strong>em apenas 7 dias ({{data_vencimento}})</strong>.

Pedimos que realize o pagamento no prazo estabelecido para evitar possíveis pendências em sua conta. Qualquer dúvida sobre os detalhes da cobrança, não hesite em nos contatar através dos canais de atendimento disponibilizados abaixo.

Clique no botão abaixo para regularizar seu pagamento agora.""",
    
    'cobranca-15dias.html': """Prezado {{cliente_nome}},

Este é um aviso importante: sua cobrança está com <strong>15 dias de atraso</strong>. 

Você possui uma dívida referente à {{empresa_nome}} (CNPJ: {{empresa_cnpj}}) no valor de <strong>{{valor_formato}}</strong>, dividida em <strong>{{parcelas}}</strong> parcelas, que deveria ter sido paga em <strong>{{data_vencimento}}</strong>.

Solicitamos atenção imediata para regularização desta pendência. Atrasos podem prejudicar sua reputação e resultar em restrições de serviços. Recomendamos que efetue o pagamento o quanto antes para evitar consequências maiores.

Clique no botão abaixo para regularizar seu pagamento imediatamente.""",
    
    'cobranca-30dias.html': """Prezado {{cliente_nome}},

AVISO URGENTE: Sua cobrança está com <strong>30 dias de atraso</strong>.

Você possui uma dívida crítica referente à {{empresa_nome}} (CNPJ: {{empresa_cnpj}}) no valor de <strong>{{valor_formato}}</strong>, dividida em <strong>{{parcelas}}</strong> parcelas, que venceu em <strong>{{data_vencimento}}</strong> e ainda não foi regularizada.

Esta é uma notificação de urgência máxima. A falta de pagamento pode resultar em restrições severas de acesso aos nossos serviços e impactar suas operações. Procure regularizar este pagamento imediatamente. Caso não haja regularização nos próximos dias, medidas adicionais podem ser tomadas.

Entre em contato conosco urgentemente para discutir opções de parcelamento ou negociação.""",
    
    'solicitacao-contato.html': """Prezado {{cliente_nome}},

Recebemos sua solicitação de contato enviada em <strong>{{data_contato}}</strong>. Agradecemos o interesse em nossos serviços e a oportunidade de conversar com você.

Nossa equipe analisará sua mensagem com atenção e retornaremos em breve com mais informações. Fique atento à sua caixa de entrada e também à pasta de spam para não perder nossa resposta.

Se a sua dúvida for urgente, você também pode entrar em contato direto conosco através dos dados disponibilizados abaixo."""
}

def create_template(body_text):
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROTEQ Jr - Notificação</title>
    <style>
{css}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header com Logo PROTEQ -->
        <div class="header">
            <img src="cid:logo-proteq" alt="PROTEQ Jr" class="logo">
        </div>

        <!-- Conteúdo Principal -->
        <div class="content">
            <div class="body-text">
{body_text}
            </div>

            <!-- Botão de Ação -->
            <div class="button-container">
                <a href="{{link_pagamento}}" class="button">Realizar Pagamento</a>
            </div>

            <!-- Seção de Contato -->
            <div class="contact-section">
                <div class="contact-label">Entre em Contato</div>
                <div class="contact-info">
                    <p><strong>Email:</strong> contato@proteqjr.com.br</p>
                    <p><strong>Telefone:</strong> (82) 99329-7024</p>
                </div>
            </div>

            <!-- Assinatura -->
            <div class="signature">
                Atenciosamente,
                <strong>PROTEQ Jr - Tecnologia e Inovação</strong>
            </div>
        </div>

        <!-- Rodapé -->
        <div class="footer">
            <p>Esta é uma mensagem automática. Por favor, não responda este e-mail.</p>
            <p>&copy; 2025-2026 PROTEQ Jr. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>"""

# Criar os novos templates
template_dir = r'c:\Users\afonso\Desktop\faculdade\backend\templates'

for filename, body_text in templates.items():
    filepath = os.path.join(template_dir, filename)
    content = create_template(body_text)
    
    # Escrever novo arquivo
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {filename} - texto corrido com fundo azul PROTEQ")

print("\n✨ Todos os 5 templates foram refeitos!")
print("✨ Agora com: logo PROTEQ, fundo azul, texto corrido, informações integradas!")
