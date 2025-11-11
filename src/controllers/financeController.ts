import { Request, Response, NextFunction } from 'express';
import financeService from '../services/FinanceServices';
import { User } from '../models/User';

// Helper: tenta obter o ID do usuário a partir do token (req.user) ou buscando pelo email
async function resolveUserIdFromRequest(req: Request): Promise<string | null> {
    const tokenUser = (req as any).user as any;
    if (!tokenUser) return null;

    // Senão, tente buscar o usuário pelo email (o protectedMiddleware retorna email + role)
    if (tokenUser.email) {
        const existing = await User.findOne({ email: tokenUser.email });
        if (existing && existing._id) return (existing as any)._id.toString();
    }

    return null;
}

// Helper: verifica se o usuário é admin
function isUserAdmin(req: Request): boolean {
    const tokenUser = (req as any).user as any;
    return tokenUser && tokenUser.role === 'admin';
}

/* Controller mantém os nomes exportados esperados pelas rotas atuais (CreateTask, GetTasksByUserId...) 
     mas implementa lógica para financiamentos. */

export const CreateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem criar financiamentos
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem criar financiamentos.' });
        }

        const userId = await resolveUserIdFromRequest(req);
        if (!userId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

        const payload = req.body;
        const result = await financeService.createFinance(userId, { ...payload });
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const GetTasksByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem listar seus próprios financiamentos (não deveriam ter)
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não possuem financiamentos próprios.' });
        }

        const userId = await resolveUserIdFromRequest(req);
        if (!userId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

        const filters = req.query;
        const result = await financeService.getFinancesByUserId(userId, filters);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const GetTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem acessar financiamentos como se fossem donos
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem acessar financiamentos desta forma.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const result = await financeService.getFinancesById(financeId, userId);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const FullUpdateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem atualizar financiamentos desta forma (apenas alterar status via lógica específica)
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const updateData = req.body;
        if (updateData.userId && updateData.userId !== userId) {
            return res.status(403).json({ message: 'Não é permitido alterar o ID do usuário do financiamento.' });
        }

        const result = await financeService.updateFinance(financeId, userId, updateData);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const PartialUpdateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem atualizar financiamentos desta forma (apenas alterar status via lógica específica)
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem atualizar financiamentos como usuário comum.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const updateData = req.body;
        const result = await financeService.updateFinance(financeId, userId, updateData);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const DeleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Admins não podem deletar financiamentos desta forma
        if (isUserAdmin(req)) {
            return res.status(403).json({ message: 'Administradores não podem deletar financiamentos como usuário comum.' });
        }

        const financeId = req.params.id;
        const userId = await resolveUserIdFromRequest(req);
        if (!userId || !financeId) return res.status(400).json({ message: 'ID do usuário e ID do financiamento são obrigatórios.' });

        const result = await financeService.deleteFinance(financeId, userId);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
};

export const restoreTask = async (req: Request, res: Response, next: NextFunction) => {
    // Restauração de exclusão não implementada: usar soft-delete na model se necessário.
    return res.status(501).json({ message: 'Restauração de financiamento não implementada.' });
};
