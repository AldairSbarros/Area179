import { Router } from 'express';
import {
  list,
  create,
  update,
  deleteUsuario,
  resetPassword,
  changePassword
} from '../controllers/usuarioController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware(['admin']), list);
router.post('/', authMiddleware(['admin']), create);
router.put('/:id', authMiddleware(['admin']), update);
router.delete('/:id', authMiddleware(['admin']), deleteUsuario);
router.patch('/:id/reset-password', authMiddleware(['admin']), resetPassword);
router.patch('/change-password', authMiddleware(), (req, res, next) => {
  Promise.resolve(changePassword(req, res)).catch(next);
});

export default router;