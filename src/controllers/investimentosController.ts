import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import manualCodigos from '../utils/manualCodigos.json';

const prisma = new PrismaClient();

export const criarInvestimento = async (req: Request, res: Response): Promise<void> => {
  try {
    let { congregacaoId, descricao, valor, data, categoria, codigoManual } = req.body;

    if (codigoManual && !descricao) {
      const found = manualCodigos.investimentos.find(i => i.codigo === codigoManual);
      if (found) descricao = found.descricao;
    }
    if (descricao && !codigoManual) {
      const found = manualCodigos.investimentos.find(i => i.descricao.toLowerCase() === descricao.toLowerCase());
      if (found) codigoManual = found.codigo;
    }

    if (!codigoManual || !descricao) {
      res.status(400).json({ error: 'Código ou descrição de investimento inválidos.' });
      return;
    }

    const investimento = await prisma.investimento.create({
      data: {
        congregacaoId: Number(congregacaoId),
        descricao,
        valor: Number(valor),
        data: new Date(data),
        categoria,
        codigoManual
      }
    });

    res.status(201).json(investimento);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
