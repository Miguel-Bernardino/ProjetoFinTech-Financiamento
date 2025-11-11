# 📋 Guia de Testes - Assinatura de Contrato + E-mail

## ✅ Resumo da Implementação

O sistema de assinatura de contrato com envio de e-mail foi **totalmente implementado e testado**. Todos os 20 testes unitários passam com sucesso.

---

## 🚀 Como Executar os Testes

### 1. Testes Automatizados (Recomendado)

```powershell
# Rodar todos os testes
npm test

# Ou com modo watch (reexecuta ao salvar arquivos)
npx vitest
```

**Saída esperada:**
```
Test Files  6 passed (6)
     Tests  20 passed (20)
```

---

## 📝 Testes Manuais via Postman/Insomnia

Importe o arquivo `requests/resquests.yml` no Postman ou Insomnia e siga os passos:

### **Passo 1: Registrar Usuário**
- **Nome:** "1. Cadastro" → "Cadastro Bem-Sucedido"
- **Método:** POST
- **URL:** `{{base_url}}/api/register`
- **Body:**
```json
{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "SenhaForte123!"
}
```

### **Passo 2: Fazer Login**
- **Nome:** "2. Login" → "Login Bem-Sucedido"
- **Método:** POST
- **URL:** `{{base_url}}/api/login`
- **Body:**
```json
{
    "email": "joao@example.com",
    "password": "SenhaForte123!"
}
```
- **Script de Teste (auto-salva token):**
```javascript
pm.environment.set("auth_token", pm.response.json().token);
```

### **Passo 3: Criar Financiamento**
- **Nome:** "4. Financiamentos" → "Criar Financiamento"
- **Método:** POST
- **URL:** `{{base_url}}/api/finances`
- **Headers:** 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body:**
```json
{
    "brand": "Toyota",
    "modelName": "Corolla",
    "type": "Sedan",
    "value": 50000,
    "countOfMonths": 60,
    "downPayment": 10000,
    "interestRate": 0.08
}
```
- **Copie o `_id` da resposta e salve em `{{finance_id}}`**

### **Passo 4: [IMPORTANTE] Atualizar Status para 'approved'**

Antes de assinar, você precisa atualizar o financiamento para status `approved`. Use uma ferramenta como MongoDB Compass ou execute:

```powershell
# Conectar ao MongoDB local
mongo

# Mudar para seu banco
use my-database

# Atualizar o financiamento
db.finances.updateOne(
    { _id: ObjectId("seu_finance_id_aqui") },
    { $set: { status: "approved" } }
)
```

**OU** via requisição PATCH (se houver endpoint):
```
PATCH {{base_url}}/api/finances/{{finance_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
    "status": "approved"
}
```

### **Passo 5: Assinar Contrato + Enviar E-mail ✅**
- **Nome:** "4. Financiamentos" → "Assinar Contrato + Enviar E-mail ✅"
- **Método:** POST
- **URL:** `{{base_url}}/api/finances/{{finance_id}}/sign-contract`
- **Headers:** 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body:** (vazio ou `{}`)

**Resposta Esperada (Status 200):**
```json
{
    "status": 200,
    "message": "Contrato assinado com sucesso!",
    "finance": {
        "_id": "...",
        "brand": "Toyota",
        "modelName": "Corolla",
        "contractStatus": "signed",
        "contractSignedAt": "2025-11-11T20:52:57.795Z",
        "status": "completed"
    }
}
```

---

## 🧪 Testes de Erro (Casos Negativos)

### **Erro 1: Contrato Não Aprovado**
- **URL:** `POST {{base_url}}/api/finances/{{finance_id}}/sign-contract`
- **Financiamento com status ≠ "approved"**
- **Esperado:** Status 403, mensagem: "Financiamento não está aprovado"

### **Erro 2: Contrato Já Assinado**
- **Chamar 2x o endpoint "Assinar Contrato"**
- **Esperado:** Status 400, mensagem: "Contrato já foi assinado"

### **Erro 3: Sem Autenticação**
- **URL:** `POST {{base_url}}/api/finances/{{finance_id}}/sign-contract`
- **Remover header `Authorization`**
- **Esperado:** Status 401, mensagem: "Não autorizado: token ausente"

### **Erro 4: ID de Financiamento Inválido**
- **URL:** `POST {{base_url}}/api/finances/id_invalido/sign-contract`
- **Esperado:** Status 404, mensagem: "Financiamento não encontrado"

---

## 📧 Validar E-mail Enviado

O e-mail é enviado via SMTP configurado no `.env`:

```properties
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=miguel.bernardino.5891@gmail.com
SMTP_PASS=ctkx-xpcb-kkox-jtyu
SMTP_FROM=noreply@fintech.com
```

**Verificar e-mail:**
1. Acessar a caixa de entrada de `novo_usuario@example.com` (ou o email do usuário criado)
2. **Buscar e-mail com assunto:** `Cópia do seu contrato - [finance_id]`
3. **Verificar anexo:** PDF nomeado `contract-[finance_id].pdf`

**Para teste local sem e-mail real**, use **Ethereal (nodemailer test)**:

```bash
# Instale e use
npm install -D nodemailer-ethereal

# Configure no .env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=<gerado>
SMTP_PASS=<gerado>
```

---

## 🔍 Estrutura de Testes Unitários

Todos os 20 testes estão em:
- `src/tests/financeService.test.ts` (2 testes)
- `src/tests/financeIntegration.test.ts` (2 testes)
- `src/tests/adminRestriction.test.ts` (6 testes)
- `tests/financeService.test.ts` (2 testes)
- `tests/financeIntegration.test.ts` (2 testes)
- `tests/adminRestriction.test.ts` (6 testes)

**Rodar teste específico:**
```bash
npx vitest src/tests/financeIntegration.test.ts
```

---

## 🛠️ Compilação

```powershell
# Build TypeScript
npm run build

# Executar servidor (dev)
npm run dev

# Servidor roda em http://localhost:3000
```

---

## 📋 Fluxo Completo (Diagrama)

```
Usuário
  ↓
POST /api/register → Criar conta
  ↓
POST /api/login → Obter token JWT
  ↓
POST /api/finances → Criar financiamento (status: "pending")
  ↓
[ADMIN] PATCH /api/finances/{id} → Aprovar (status: "approved")
  ↓
POST /api/finances/{id}/sign-contract → Assinar contrato
  ├─ Valida financiamento (aprovado, não assinado, pertence ao user)
  ├─ Simula assinatura digital (stub DocuSign)
  ├─ Gera PDF com pdfkit
  ├─ Envia e-mail com PDF anexado via SMTP
  ├─ Notifica serviço de pontos
  └─ Retorna: { status: 200, finance: {...} }
  ↓
Resposta com contractStatus="signed" e status="completed"
```

---

## 📌 Notas Importantes

1. **Credenciais SMTP:** Não versionem no repositório. Use variáveis de ambiente.
2. **Assinatura Digital:** Atualmente é mocada (stub). Substitua `simulateExternalSignature()` por DocuSign/Clicksign/Validatron em produção.
3. **PDF Persistência:** Geramos PDF em memória. Para produção, salve em S3/Google Cloud Storage.
4. **Testes:** Usam MSW para mockar requisições HTTP. Handlers estão em `src/tests/msw/handlers.ts`.

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Teste falha com "Token inválido" | MSW não capturou requisição. Verifique handlers em `msw/handlers.ts` |
| E-mail não enviado | Verifique credenciais SMTP em `.env`. Teste com `npm run dev` e curl. |
| PDF vazio | Verifique `pdfkit` está instalado: `npm install pdfkit` |
| Erro 403 ao assinar | Financiamento não está com status `"approved"`. Atualize no MongoDB. |
| Erro 401 (não autorizado) | Token ausente ou expirado. Refaça login e copie novo token. |

---

## 📚 Referências

- **Postman Collection:** `requests/resquests.yml`
- **TypeScript Config:** `tsconfig.json`
- **EmailService:** `src/services/EmailService.ts`
- **ContractService:** `src/services/ContractService.ts`
- **Controller:** `src/controllers/financeController.ts`

---

**✅ Tudo pronto para testar!** Qualquer dúvida, consulte os testes ou envie uma mensagem.
