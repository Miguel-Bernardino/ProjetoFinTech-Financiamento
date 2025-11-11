// Use require to avoid needing @types for nodemailer in this repo
const nodemailer = require('nodemailer');

// Create a transporter on demand. Prefer real SMTP from env, but if not available
// or sending fails, fallback to an Ethereal test account (dev only) so emails always
// can be inspected during development.
async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // No SMTP configured — create Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, attachments } = options;

  try {
    const transporter = await createTransporter();

    const mailOptions: any = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    };

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((a: any) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal (test account), nodemailer provides a preview URL — log it for dev.
    try {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('E-mail preview URL:', preview);
    } catch (e) {
      // ignore
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    // As a last resort, attempt to fallback to Ethereal if we failed using real SMTP.
    try {
      console.warn('Tentando fallback para conta de teste (Ethereal)...');
      const testTransporter = await createTransporter();
      const mailOptions: any = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
      };
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        mailOptions.attachments = attachments.map((a: any) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType
        }));
      }
      const info = await testTransporter.sendMail(mailOptions);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log('E-mail preview URL (fallback):', preview);
      return true;
    } catch (err2) {
      console.error('Fallback Ethereal também falhou:', err2);
      return false;
    }
  }
}

export function generateContractEmail(contractNumber: string, userName: string, financeDetails: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Contrato de Financiamento</h1>
        </div>
        <div class="content">
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Seu contrato de financiamento foi gerado com sucesso!</p>
          
          <h3>Detalhes do Contrato:</h3>
          <ul>
            <li><strong>Número do Contrato:</strong> ${contractNumber}</li>
            <li><strong>Veículo:</strong> ${financeDetails.brand} ${financeDetails.modelName}</li>
            <li><strong>Valor Total:</strong> R$ ${financeDetails.value?.toFixed(2)}</li>
            <li><strong>Entrada:</strong> R$ ${financeDetails.downPayment?.toFixed(2)}</li>
            <li><strong>Parcelas:</strong> ${financeDetails.countOfMonths}x de R$ ${financeDetails.installmentValue?.toFixed(2)}</li>
          </ul>
          
          <p>Para assinar o contrato, acesse a plataforma e finalize o processo.</p>
          
          <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe FinTech</strong></p>
        </div>
        <div class="footer">
          <p>Este é um e-mail automático. Por favor, não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
