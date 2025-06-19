import { Router, Request, Response } from 'express';
import {
  create,
  list,
  updateReceiptPhoto,
  deleteReceiptPhoto,
  listReceipts,
} from '../controllers/offeringController';
import upload from '../middleware/upload';
import auth from '../middleware/auth';

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
router.post('/', auth(), create);
router.get('/', auth(), list);
router.patch('/:id/receipt-photo', auth(), updateReceiptPhoto);
router.delete('/:id/receipt-photo', auth(), async (req, res, next) => {
  try {
    await deleteReceiptPhoto(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/receipts', auth(),list);

export default router;