import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import { resumoFinanceiro } from '../controllers/dashController';

const router = Router();

router.get('/resumo-financeiro', authMiddleware(['admin']), (req, res, next) => {
  resumoFinanceiro(req, res).catch(next);
});

export default router;