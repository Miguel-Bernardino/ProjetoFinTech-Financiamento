import { Router } from 'express';
import * as financeController from '../controllers/financeController';
import {protectedMiddleware} from '../middleware/protectedMiddleware';

const router = Router();

router.use(protectedMiddleware);

//Criacao de financiamentos
router.post('/finances', financeController.CreateFinance);

//Obter financiamentos do usuario
router.get("/finances", financeController.GetFinancesByUserId);
router.get('/finances/:id', financeController.GetFinanceById);

//Atualizacao de financiamentos
router.put('/finances/:id', financeController.FullUpdateFinance);
router.patch('/finances/:id', financeController.PartialUpdateFinance);

//Delecao e restauracao de financiamentos
router.delete('/finances/:id', financeController.DeleteFinance);
router.patch('/finances/:id/restore', financeController.RestoreFinance);

export default router;