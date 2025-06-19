import { Router } from 'express';
import { criarReceita } from '../controllers/receitasController';
import auth from '../middleware/auth';

const router = Router();

// Rota protegida para criar receita
router.post('/', auth(), criarReceita);

export default router;