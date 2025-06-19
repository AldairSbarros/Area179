import { Router } from "express";
import auth from "../middleware/auth";
import * as relatorioController from "../controllers/relatorioController";

const router = Router();

// Helper to wrap async route handlers
function asyncHandler(fn: any) {
	return function(req: any, res: any, next: any) {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

router.get('/mensal', auth(['pastor', 'admin']), asyncHandler(relatorioController.relatorioMensal));
router.get('/mensal/pdf', auth(['pastor', 'admin']), asyncHandler(relatorioController.relatorioMensalPDF));

export default router;