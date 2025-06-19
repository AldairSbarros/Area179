import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import manualCodigos from '../utils/manualCodigos.json';

const prisma = new PrismaClient();

export const criarDespesa = async (req: Request, res: Response): Promise<void> => {
  try {
    let { congregacaoId, descricao, valor, data, categoria, codigoManual } = req.body;
    const notaFiscalFoto = req.file ? req.file.path.replace(/\\/g, '/') : null;

    if (codigoManual && !descricao) {
      const found = manualCodigos.despesas.find(d => d.codigo === codigoManual);
      if (found) descricao = found.descricao;
    }

    if (descricao && !codigoManual) {
      const found = manualCodigos.despesas.find(d => d.descricao.toLowerCase() === descricao.toLowerCase());
      if (found) codigoManual = found.codigo;
    }

    if (!codigoManual || !descricao) {
      res.status(400).json({ error: 'Código ou descrição de despesa inválidos.' });
      return;
    }

    const despesa = await prisma.despesa.create({
      data: {
        congregacaoId: Number(congregacaoId),
        descricao,
        valor: Number(valor),
        data: new Date(data),
        categoria,
        codigoManual,
        notaFiscalFoto
      }
    });

    res.status(201).json(despesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listarDespesas = async (req: Request, res: Response) => {
  try {
    const despesas = await prisma.despesa.findMany({
      orderBy: { data: 'desc' }, // Lista da mais recente para a mais antiga
    });

    res.status(200).json(despesas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};