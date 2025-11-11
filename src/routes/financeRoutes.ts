import { Router } from 'express';
import * as financeController from '../controllers/financeController';
import {protectedMiddleware} from '../middleware/protectedMiddleware';

const router = Router();

router.use(protectedMiddleware);

//Criacao de financiamentos
router.post('/finances', financeController.CreateTask);

//Obter financiamentos do usuario
router.get("/finances", financeController.GetTasksByUserId);
router.get('/finances/:id', financeController.GetTaskById);

//Atualizacao de financiamentos
router.put('/finances/:id', financeController.FullUpdateTask);
router.patch('/finances/:id', financeController.PartialUpdateTask);

//Delecao e restauracao de financiamentos
router.delete('/finances/:id', financeController.DeleteTask);
router.patch('/finances/:id/restore', financeController.restoreTask);

export default router;