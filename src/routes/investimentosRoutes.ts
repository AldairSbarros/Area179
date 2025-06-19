import { Router } from 'express';
import { criarInvestimento } from '../controllers/investimentosController';
import auth from '../middleware/auth';

const router = Router();

// Defina suas rotas aqui

export default router;

// Rota protegida para criar investimento
router.post('/', auth(), criarInvestimento);