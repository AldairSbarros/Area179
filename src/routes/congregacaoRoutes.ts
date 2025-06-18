import { Router } from 'express';
import { create, list } from '../controllers/congregacaoController';

const router = Router();

router.post('/', create);
router.get('/', list);

export default router;