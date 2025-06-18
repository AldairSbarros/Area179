import { Router } from 'express';
import { create,  } from '../controllers/memberController';

const router = Router();

router.post('/', create);


export default router;