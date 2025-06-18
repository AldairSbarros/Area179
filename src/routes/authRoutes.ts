import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', (req, res, next) => {
  Promise.resolve(login(req, res)).catch(next);
});

export default router;