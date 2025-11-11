import { Router } from 'express';
import * as financeController from '../controllers/financeController';
import {protectedMiddleware} from '../middleware/protectedMiddleware';

const router = Router();

router.use(protectedMiddleware);

//Criacao de financiamentos
/**
 * @openapi
 * /api/finances:
 *   post:
 *     tags: [Finances]
 *     summary: Criar um financiamento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Finance'
 *     responses:
 *       201:
 *         description: Financiamento criado
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Proibido
 */
router.post('/finances', financeController.CreateFinance);

//Obter financiamentos do usuario
/**
 * @openapi
 * /api/finances:
 *   get:
 *     tags: [Finances]
 *     summary: Listar financiamentos do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/finances', financeController.GetFinancesByUserId);
/**
 * @openapi
 * /api/finances/{id}:
 *   get:
 *     tags: [Finances]
 *     summary: Obter financiamento por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Não encontrado
 */
router.get('/finances/:id', financeController.GetFinanceById);

//Atualizacao de financiamentos
/**
 * @openapi
 * /api/finances/{id}:
 *   put:
 *     tags: [Finances]
 *     summary: Atualizar completamente um financiamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Finance'
 *     responses:
 *       200:
 *         description: OK
 */
router.put('/finances/:id', financeController.FullUpdateFinance);
/**
 * @openapi
 * /api/finances/{id}:
 *   patch:
 *     tags: [Finances]
 *     summary: Atualização parcial
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/finances/:id', financeController.PartialUpdateFinance);

//Delecao e restauracao de financiamentos
/**
 * @openapi
 * /api/finances/{id}:
 *   delete:
 *     tags: [Finances]
 *     summary: Deletar financiamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/finances/:id', financeController.DeleteFinance);
/**
 * @openapi
 * /api/finances/{id}/restore:
 *   patch:
 *     tags: [Finances]
 *     summary: Restaurar financiamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       501:
 *         description: Não implementado
 */
router.patch('/finances/:id/restore', financeController.RestoreFinance);

//Assinatura de contrato
/**
 * @openapi
 * /api/finances/{id}/sign-contract:
 *   post:
 *     tags: [Finances]
 *     summary: Assinar contrato de financiamento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do financiamento
 *     responses:
 *       200:
 *         description: Contrato assinado com sucesso
 *       400:
 *         description: Requisição inválida ou contrato já assinado
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Usuário não é proprietário do financiamento
 *       404:
 *         description: Financiamento não encontrado
 */
router.post('/finances/:id/sign-contract', financeController.SignContract);

export default router;