import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { criarDespesa, listarDespesas } from '../controllers/despesaController';
import authMiddleware from '../middleware/auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/notas'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post(
  '/',
  authMiddleware(['admin', 'tesoureiro', 'dirigente']),
  upload.single('notaFiscalFoto'),
  criarDespesa
);

router.get(
  '/',
  authMiddleware(['admin', 'tesoureiro', 'dirigente']),
  listarDespesas
);

export default router;