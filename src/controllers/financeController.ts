import { Request, Response, NextFunction } from 'express';
import financeService from '../services/FinanceServices';
import { IFinance } from '../models/Finance';

// Helper: tenta obter o ID do usuário a partir do token (req.user)
async function resolveUserIdFromRequest(req: Request): Promise<string | null> {
    const tokenUser = (req as any).user as any;
    if (!tokenUser) return null;

    // Se o protectedMiddleware retornou um user com _id, use-o
    if (tokenUser._id) return tokenUser._id;
    if (tokenUser.id) return tokenUser.id;

    return null;
}

// Helper: verifica se o usuário é admin
function isUserAdmin(req: Request): boolean {
    const tokenUser = (req as any).user as any;
    return tokenUser && tokenUser.role === 'admin';
}

/* Controller mantém os nomes exportados esperados pelas rotas atuais (CreateTask, GetTasksByUserId...) 
     mas implementa lógica para financiamentos. */

export const CreateFinance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem criar financiamentos
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem criar financiamentos.' });
        }

        const userId = await resolveUserIdFromRequest(req);
        if (!userId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

        const payload = req.body;
        payload.deleted = false;
        const result = await financeService.createFinance(userId, { ...payload });
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const GetFinancesByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = await resolveUserIdFromRequest(req);
        if (!userId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

        const result = await financeService.getFinancesByUserId(userId, req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const GetFinanceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const result = await financeService.getFinancesById(financeId, userId);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const FullUpdateFinance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem atualizar financiamentos desta forma (apenas alterar status via lógica específica)
        if (!isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        let updateData: IFinance = req.body;

        if (updateData.deleted === true) {
            return res.status(403).json({ message: 'Não é permitido deletar financiamentos desta forma.' });
        }
        
        updateData.deleted = false;

        if (updateData.userId && updateData.userId !== userId) {
            return res.status(403).json({ message: 'Não é permitido alterar o ID do usuário do financiamento.' });
        }

        const result = await financeService.updateFinance(financeId, userId, updateData);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const PartialUpdateFinance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem atualizar financiamentos desta forma (apenas alterar status via lógica específica)
        if (!isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const updateData = req.body;
        
        if (updateData.deleted === true) {
            return res.status(403).json({ message: 'Não é permitido deletar financiamentos desta forma.' });
        }  

        const result = await financeService.updateFinance(financeId, userId, updateData);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const DeleteFinance = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!isUserAdmin(req)) {
            return res.status(403).json({ message: 'Usuário não autorizado.' });
        }

        const financeId = req.body.id;
        const userId = req.body.userId;
        if (!userId || !financeId) 
            return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const result = await financeService.deleteFinance(financeId, userId); 
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const RestoreFinance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('RestoreFinance controller called');
        if (!isUserAdmin(req)) {
            return res.status(403).json({ message: 'Usuário não autorizado.' });
        }

        const financeId = req.body.id;
        const userId = req.body.userId;
        if (!userId || !financeId) 
            return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });
        
        const result = await financeService.RestoreFinance(financeId, userId);
        return res.status(result.status).json(result);

    } catch (error) {
        next(error);
    }
};
