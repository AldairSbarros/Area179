import { Router } from 'express';
import { create, list } from '../controllers/memberController';

const router = Router();

router.post('/', create);
router.get('/', list);

export default router;