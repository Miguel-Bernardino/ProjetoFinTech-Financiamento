// Use require to avoid needing @types for nodemailer in this repo
const nodemailer = require('nodemailer');

const transporter: any = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

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

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
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
