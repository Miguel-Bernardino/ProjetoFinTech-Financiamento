# 📧 Configuração de Envio de E-mails

## Como funciona

Quando um contrato é assinado via `POST /api/finances/:id/sign-contract`, o sistema:

1. ✅ Atualiza o status do contrato para "signed"
2. 📧 Busca os dados do usuário (email e nome) no microserviço de usuários
3. 📤 Envia um email HTML formatado com os detalhes do contrato
4. 🎯 Notifica o microserviço de pontos

## Configuração SMTP

### Opção 1: Gmail (Recomendado para desenvolvimento)

1. Acesse sua conta Google
2. Vá em **Segurança** → **Verificação em duas etapas** (ative se não estiver)
3. Vá em **Senhas de app**: https://myaccount.google.com/apppasswords
4. Crie uma senha de app para "E-mail"
5. Configure no `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx  # Senha de app gerada
SMTP_FROM=noreply@fintech.com
```

### Opção 2: Outros provedores

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.sua-api-key
```

**Mailtrap (apenas para testes):**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu-username
SMTP_PASS=sua-senha
```

## Requisitos do Microserviço de Usuários

O serviço `USER_SERVICE_URL` deve ter o endpoint:

```
GET /users/:userId
```

Resposta esperada:
```json
{
  "email": "usuario@email.com",
  "name": "Nome do Usuário"
}
```

Ou com data wrapper:
```json
{
  "data": {
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

## Testando o envio

1. Configure as variáveis SMTP no `.env`
2. Inicie o servidor: `npm run dev`
3. Assine um contrato:

```bash
curl -X POST http://localhost:3000/api/finances/{financeId}/sign-contract \
  -H "Authorization: Bearer SEU_TOKEN"
```

4. Verifique o console para logs:
   - `Email de confirmação enviado para usuario@email.com`
   - Ou erros se houver problemas de configuração

## Erros comuns

### "Erro ao enviar e-mail"
- ✅ Verifique se as credenciais SMTP estão corretas
- ✅ Para Gmail, use senha de app (não a senha normal)
- ✅ Verifique se a porta está correta (587 ou 465)

### Email não chega
- ✅ Verifique a pasta de spam
- ✅ Confirme que o email do usuário está correto no microserviço
- ✅ Use Mailtrap para testar sem enviar emails reais

## Estrutura do Email

O email enviado inclui:
- ✉️ Cabeçalho profissional com título
- 📋 Número do contrato
- 🚗 Detalhes do veículo (marca e modelo)
- 💰 Valor total, entrada e parcelas
- 📅 Data de assinatura
- 🎨 Design responsivo e profissional

## Desabilitar emails (opcional)

Se não quiser enviar emails, simplesmente não configure as variáveis SMTP ou deixe `SMTP_USER` vazio. O sistema continuará funcionando normalmente sem enviar emails.
