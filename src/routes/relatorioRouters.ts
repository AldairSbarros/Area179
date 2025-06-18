import { Router } from "express";
import auth from "../middleware/auth";
const router = Router();

export default router;

const expressLib = require('express');
const relatorioRouter = expressLib.Router();
const relatorioController = require('../controllers/relatorioController');

relatorioRouter.get('/mensal', auth(['pastor', 'admin']), relatorioController.relatorioMensal);
relatorioRouter.get('/mensal/pdf', auth(['pastor', 'admin']), relatorioController.relatorioMensalPDF);

module.exports = relatorioRouter;