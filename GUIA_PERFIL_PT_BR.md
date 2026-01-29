# 🎯 Guia Rápido do Sistema de Perfil

## O que mudou?

### 1️⃣ Novo Avatar no Canto Superior Direito
- **Antes**: Botão vermelho "Sair"
- **Agora**: Círculo colorido com sua inicial ou foto

### 2️⃣ Menu de Perfil (Clique no Avatar)
```
┌─────────────────────────────┐
│ Seu Nome                    │
│ seu@email.com               │
├─────────────────────────────┤
│ ⚙️  Configurações            │
├─────────────────────────────┤
│ 🚪 Sair                     │
└─────────────────────────────┘
```

### 3️⃣ Configurações de Perfil (Modal)
Clique em ⚙️ Configurações para:
- ✏️ Alterar seu **Nome**
- ✏️ Alterar seu **Email**
- 📸 **Upload de Foto** (até 5MB)
- 💾 **Salvar** as mudanças

### 4️⃣ Exportar Dados
- **Antes**: Botão no topo da lista de clientes
- **Agora**: Botão no Dashboard junto com período (Mês/Trimestre/Ano)

---

## ✨ Recursos do Avatar

### Visual
- 🎨 Gradiente azul e roxo (quando sem foto)
- 📸 Sua foto redonda (quando fizer upload)
- ✨ Efeito hover (cresce um pouco ao passar o mouse)

### Interação
- 👆 Clique para abrir menu
- 📤 Altere sua foto quando quiser
- ✏️ Edite nome e email
- 🚪 Faça logout sempre que precisar

---

## 📊 Exportar Dados do Dashboard

### Onde está?
Topo do Dashboard, ao lado de "Mês | Trimestre | Ano"

### Opções:
1. **CSV** 📥 - Baixa um arquivo `.csv` para abrir no Excel
2. **Sheets** 📊 - Copia dados para colar no Google Sheets

### Como usar:
1. Vá para a aba **Dashboard**
2. Escolha o período (Mês/Trimestre/Ano)
3. Clique em **CSV** ou **Sheets**
4. Pronto! Os dados já estão baixados ou na clipboard

---

## 🔐 Dados de Perfil (Supabase)

Seus dados são salvos em:
- 📦 **Nome e Email** → Banco de dados (tabela `profiles`)
- 📸 **Foto** → Storage (`perfil-imagens`)

Todos criptografados e seguros! 🔒

---

## ❓ Perguntas Frequentes

### P: Preciso fazer algo especial para usar o avatar?
**R**: Não! Ele já vem pronto. Apenas clique e customize.

### P: Posso trocar minha foto depois?
**R**: Sim! Sempre que quiser. Clique no avatar → Configurações → Alterar Foto.

### P: Minha foto não aparece?
**R**: Pode ser:
1. Arquivo muito grande (máx 5MB)
2. Banco de dados não configurado
3. Verificar console do navegador (F12)

### P: E se eu não quiser foto?
**R**: Tudo bem! O avatar mostra sua inicial automaticamente.

### P: Onde minha foto é armazenada?
**R**: Em um bucket seguro do Supabase chamado `perfil-imagens`.

---

## 🎨 Visual do Avatar

```
Sem foto:               Com foto:
┌─────────┐            ┌─────────┐
│    A    │            │ [FOTO]  │
│  (azul) │            │ (round) │
└─────────┘            └─────────┘
```

---

## 📱 Funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

---

## 💡 Dica

Para melhor experiência:
- Use foto quadrada (1:1)
- Tamanho: ~200x200px ou maior
- Formato: JPG, PNG, WEBP

---

## 🆘 Precisa de Ajuda?

1. Verifique o console (F12) para erros
2. Leia o arquivo `PROFILE_SETUP.md` para configuração Supabase
3. Verifique o arquivo `CHANGES_SUMMARY.md` para mais detalhes

---

**Aproveite o novo sistema de perfil! 🚀**
