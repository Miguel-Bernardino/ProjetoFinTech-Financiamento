import { IFinance, Finance } from '../models/Finance';
import { IUser, User } from '../models/User';

async function isUserExists(userId: any): Promise<any> {
    if (!userId) return null;
    const user = await User.findOne({ _id: userId });
    return user;
}

async function isValidUser(financeId: any, userTokenedId: string): Promise<any> {
    const query = { _id: financeId };
    const finance = await Finance.findOne(query);

    if (!finance) {
        return { status: 404, message: 'Financiamento não encontrado.' };
    }

    if (!userTokenedId || finance.userId !== userTokenedId) {
        return { status: 403, message: 'Acesso negado ao financiamento.' };
    }

    const user = await User.findOne({ _id: userTokenedId });
    if (!user) {
        return { status: 404, message: 'Usuário não encontrado.' };
    }

    return { status: 200, user };
}

/**
 * Calcula o valor da parcela (sistema PRICE - parcela fixa) e/ou a tabela de amortização.
 * interestRate: taxa anual em decimal (ex: 0.08 = 8% a.a.)
 */
export function calculateInstallment(principal: number, annualInterestRate: number, months: number): number {
    if (months <= 0) return 0;
    const monthlyRate = annualInterestRate / 12;
    if (monthlyRate === 0) return principal / months;
    const r = monthlyRate;
    const installment = principal * (r / (1 - Math.pow(1 + r, -months)));
    return Number(installment.toFixed(2));
}

export function calculateAmortizationSchedule(principal: number, annualInterestRate: number, months: number, installment?: number) {
    const monthlyRate = annualInterestRate / 12;
    const payment = installment ?? calculateInstallment(principal, annualInterestRate, months);

    let balance = principal;
    const schedule: Array<any> = [];
    let totalInterest = 0;

    for (let m = 1; m <= months; m++) {
        const interest = Number((balance * monthlyRate).toFixed(2));
        const principalPaid = Number(Math.min(payment - interest, balance).toFixed(2));
        balance = Number((balance - principalPaid).toFixed(2));
        totalInterest += interest;
        schedule.push({ month: m, payment: payment, principalPaid, interest, balance });
    }

    return { schedule, totalInterest: Number(totalInterest.toFixed(2)), payment };
}

export async function createFinance(userID: string, payload: Partial<IFinance>): Promise<any> {
    try {
        const { userId, value, downPayment = 0, interestRate = 0, countOfMonths = 0, financeDate = new Date(), brand, modelName, type, status } = payload as any;

        const usertokened = await isUserExists(userID);
        const user = await isUserExists(userId);

        if (!user || !usertokened) {
            return { status: 403, message: 'Usuário inválido.' };
        }

        if (userID !== userId) {
            return { status: 403, message: 'Não é permitido criar financiamento para outro usuário.' };
        }

        if (typeof value !== 'number' || value <= 0) {
            return { status: 400, message: 'Valor do veículo inválido.' };
        }

        const principal = Number((value - (downPayment || 0)).toFixed(2));
        const installmentValue = payload.installmentValue ?? calculateInstallment(principal, interestRate, countOfMonths);

        // Buscar características do veículo pela API externa (se configurada)
        // GET apenas RECEBE os dados (brand, modelname, type) - não envia parâmetros
        let vehicleSpecs: any = undefined;
        const baseUrl = process.env.VEHICLE_API_URL;
        if (baseUrl) {
            try {
                // GET simples - apenas recebe os dados disponíveis da API
                const resp = await fetch(baseUrl);
                if (!resp.ok) {
                    throw new Error(`Falha ao obter dados do veículo: status ${resp.status}`);
                }

                const data = await resp.json();
                
                // A API retorna os dados com {brand, modelname, type, ...}
                vehicleSpecs = data;
                
                if (!vehicleSpecs) {
                    throw new Error('Resposta da API de veículo vazia ou inválida.');
                }
            } catch (err: any) {
                throw new Error(`Não foi possível obter os dados do veículo: ${err?.message ?? err}`);
            }
        }

        const newFinance = await Finance.create({
            brand,
            modelName,
            type,
            value,
            countOfMonths,
            userId,
            downPayment,
            interestRate,
            installmentValue,
            financeDate,
            status: status ?? 'pending',
            vehicleSpecs
        } as any);

        return { status: 201, finance: newFinance };
    } catch (error) {
        return { status: 500, message: 'Erro ao criar o financiamento.' };
    }
}

export const getFinancesByUserId = async (userId: string, filters: any): Promise<any> => {
    try {
        const user = await isUserExists(userId);
        if (!user) return { status: 404, message: 'Usuário não encontrado.' };

        const finances = await Finance.find({ userId: userId, ...filters });
        return { status: 200, finances };
    } catch (error) {
        return { status: 500, message: 'Erro ao buscar os financiamentos.' };
    }
};

export const getFinancesById = async (financeId: string, userId: string): Promise<any> => {
    try {
        const query = { _id: financeId };
        const finance = await Finance.findOne(query);
        if (!finance) return { status: 404, message: 'Financiamento não encontrado.' };

        const validUser = await isValidUser(finance._id, userId);
        if (!validUser || validUser.status >= 400) {
            return { status: 403, message: 'Acesso negado.' };
        }

        return { status: 200, finance };
    } catch (error) {
        return { status: 500, message: 'Erro ao buscar o financiamento.' };
    }
};

export const updateFinance = async (financeId: string, userId: string, updateData: Partial<IFinance>): Promise<any> => {
    try {
        const query = { _id: financeId };
        const finance = await Finance.findOne(query);
        if (!finance) return { status: 404, message: 'Financiamento não encontrado.' };

        const validUser = await isValidUser(finance._id, userId);
        if (!validUser || validUser.status >= 400) {
            return { status: 403, message: 'Acesso negado.' };
        }

        // Apenas admin pode alterar status ou campos sensíveis
        if (updateData.status && validUser.user.role !== 'admin') {
            return { status: 403, message: 'Apenas administradores podem alterar o status.' };
        }

        Object.assign(finance, updateData);
        await finance.save();
        return { status: 200, finance };
    } catch (error) {
        return { status: 500, message: 'Erro ao atualizar o financiamento.' };
    }
};

export const deleteFinance = async (financeId: string, userId: string): Promise<any> => {
    try {
        const finance = await Finance.findById(financeId);
        if (!finance) return { status: 404, message: 'Financiamento não encontrado.' };

        const validUser = await isValidUser(finance._id, userId);
        if (!validUser || validUser.status >= 400) return { status: 403, message: 'Acesso negado.' };

        await Finance.findByIdAndDelete(financeId);
        return { status: 200, message: 'Financiamento removido com sucesso.' };
    } catch (error) {
        return { status: 500, message: 'Erro ao deletar o financiamento.' };
    }
};

export default {
    createFinance,
    getFinancesByUserId,
    getFinancesById,
    updateFinance,
    deleteFinance,
    calculateInstallment,
    calculateAmortizationSchedule
};