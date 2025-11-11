import { Finance } from '../models/Finance';
import { sendEmail, generateContractEmail } from './EmailService';

/**
 * Assina um contrato de financiamento e notifica o microserviço de pontos
 */
export async function signContract(financeId: string, userId: string): Promise<any> {
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

        // Atualizar status do contrato
        finance.contractStatus = 'signed';
        finance.contractSignedAt = new Date();
        finance.status = 'in_progress';
        await finance.save();

        // Buscar dados do usuário para enviar email
        let userEmail = '';
        let userName = '';
        const userServiceUrl = process.env.USER_SERVICE_URL;
        
        if (userServiceUrl) {
            try {
                const userResponse = await fetch(`${userServiceUrl}/users/${userId}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userEmail = userData.email || userData.data?.email;
                    userName = userData.name || userData.data?.name || 'Cliente';
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        }

        // Enviar email de confirmação
        if (userEmail) {
            try {
                const emailHtml = generateContractEmail(
                    String(finance._id),
                    userName,
                    finance
                );
                
                await sendEmail({
                    to: userEmail,
                    subject: 'Contrato de Financiamento Assinado - FinTech',
                    html: emailHtml
                });
                
                console.log(`Email de confirmação enviado para ${userEmail}`);
            } catch (error) {
                console.error('Erro ao enviar email de confirmação:', error);
                // Não falha a operação se o email não for enviado
            }
        }

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

export default {
    signContract
};
