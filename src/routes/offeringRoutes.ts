import { Router, Request, Response } from 'express';
import {
  create,
  list,
  updateReceiptPhoto,
  deleteReceiptPhoto,
  
} from '../controllers/offeringController';
import upload from '../middleware/upload';


const router = Router();

// Upload da foto do talão (rota livre)
router.post('/upload-receipt', upload.single('receiptPhoto'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }
  // Caminho relativo para salvar no banco
  const filePath = `/uploads/${req.body.congregacaoId}/${req.body.ano}-${req.body.mes}/${req.file.filename}`;
  res.json({ filePath });
});

// Rotas protegidas
router.post('/', authMiddleware(), create);
router.get('/', authMiddleware(), list);
router.patch('/:id/receipt-photo', authMiddleware(), updateReceiptPhoto);
router.delete('/:id/receipt-photo', authMiddleware(), async (req, res, next) => {
  try {
    await deleteReceiptPhoto(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/receipts', authMiddleware(), list);

export default router;

function authMiddleware(): import("express-serve-static-core").RequestHandler {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.split(' ')[1];
    // Here you would normally verify the token (e.g., using JWT)
    // For demonstration, we'll just check if token exists
    if (!token) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    // If token is valid, proceed
    next();
  };
}
