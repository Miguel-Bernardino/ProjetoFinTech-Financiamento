import { Finance } from '../models/Finance';

/**
 * Assina um contrato de financiamento e notifica o microserviço de pontos
 */
export async function signContract(financeId: string, userId: string, userEmail?: string): Promise<any> {
    try {
        // Buscar financiamento
        const finance = await Finance.findById(financeId);
        if (!finance) {
            return { status: 404, message: 'Financiamento não encontrado.' };
        }

        // Verificar ownership
        if (finance.userId !== userId) {
            return { status: 403, message: 'Você não tem permissão para assinar este contrato.' };
        }

        // Verificar se já foi assinado
        if (finance.contractStatus === 'signed') {
            return { status: 400, message: 'Este contrato já foi assinado.' };
        }

        // Verificar se o financiamento está aprovado
        if (finance.status !== 'approved') {
            return { status: 400, message: 'Só é possível assinar contratos de financiamentos aprovados.' };
        }

        // Simular integração com provedor externo de assinatura digital
        const externalSignature = await simulateExternalSignature(finance, userId);

        // Atualizar status do contrato localmente
        finance.contractStatus = 'signed';
        finance.contractSignedAt = externalSignature.signedAt || new Date();
        finance.status = 'in_progress';
        await finance.save();

        // Notificar microserviço de pontos (API externa da outra equipe)
        const pointsServiceUrl = process.env.POINTS_SERVICE_URL;
        if (pointsServiceUrl) {
            try {
                const response = await fetch(`${pointsServiceUrl}/contracts/completed`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: finance.userId,
                        financeId: finance._id,
                        contractValue: finance.value,
                        contractDate: finance.contractSignedAt
                    })
                });

                if (!response.ok) {
                    console.error(`Erro ao notificar serviço de pontos: ${response.status}`);
                    // Não falha a operação se o serviço de pontos estiver fora
                }
            } catch (error) {
                console.error('Falha ao conectar com serviço de pontos:', error);
                // Não falha a operação se o serviço de pontos estiver fora
            }
        }

        return {
            status: 200,
            message: 'Contrato assinado com sucesso!',
            finance: {
                id: finance._id,
                contractStatus: finance.contractStatus,
                contractSignedAt: finance.contractSignedAt,
                status: finance.status
            }
        };
    } catch (error) {
        console.error('Erro ao assinar contrato:', error);
        return { status: 500, message: 'Erro ao assinar o contrato.' };
    }
}

async function simulateExternalSignature(finance: any, userId: string): Promise<{ signatureId: string; signedAt: Date }> {
    // Em produção, aqui haveria uma chamada a DocuSign/Clicksign/etc.
    // Para este repositório criamos uma simulação que retorna um id de assinatura
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ signatureId: `sig_${String(finance._id)}_${Date.now()}`, signedAt: new Date() });
        }, 300);
    });
}

function generateContractPDF(finance: any, signatureId?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: any[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            doc.fontSize(20).text('Contrato de Financiamento', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Contrato ID: ${finance._id}`);
            doc.text(`Cliente (userId): ${finance.userId}`);
            doc.text(`Marca/Modelo: ${finance.brand} ${finance.modelName}`);
            doc.text(`Valor Total: R$ ${Number(finance.value).toFixed(2)}`);
            doc.text(`Entrada: R$ ${Number(finance.downPayment || 0).toFixed(2)}`);
            doc.text(`Parcelas: ${finance.countOfMonths}x de R$ ${Number(finance.installmentValue || 0).toFixed(2)}`);
            doc.text(`Taxa de Juros (anual): ${Number(finance.interestRate || 0).toFixed(4)}`);
            doc.moveDown();

            doc.text('Termos e Condições:', { underline: true });
            doc.fontSize(10).text('Este documento representa os termos do financiamento. A assinatura é equivalente ao aceite do cliente.');
            doc.moveDown();

            doc.text(`ID da Assinatura Eletrônica: ${signatureId || 'N/A'}`);
            doc.text(`Data de Assinatura: ${finance.contractSignedAt ? finance.contractSignedAt.toISOString() : new Date().toISOString()}`);

            doc.addPage().fontSize(12).text('Cópia do contrato (cont.)');

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

export default {
    signContract
};
