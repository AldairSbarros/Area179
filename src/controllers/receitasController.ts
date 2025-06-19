import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import manualCodigos from '../utils/manualCodigos.json';

const prisma = new PrismaClient();

export const criarReceita: RequestHandler = async (req, res) => {
  try {
    let { congregacaoId, descricao, valor, data, categoria, codigoManual } = req.body;

    // Busca automática de código ou descrição
    if (codigoManual && !descricao) {
      const found = manualCodigos.receitas.find(r => r.codigo === codigoManual);
      if (found) descricao = found.descricao;
    }

    if (descricao && !codigoManual) {
      const found = manualCodigos.receitas.find(r => r.descricao.toLowerCase() === descricao.toLowerCase());
      if (found) codigoManual = found.codigo;
    }

    if (!codigoManual || !descricao) {
      res.status(400).json({ error: 'Código ou descrição de receita inválidos.' });
      return;
    }

    const receita = await prisma.receita.create({
      data: {
        congregacaoId: Number(congregacaoId),
        descricao,
        valor: Number(valor),
        data: new Date(data),
        categoria,
        codigoManual
      }
    });

    res.status(201).json(receita);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};