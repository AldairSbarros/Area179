import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cria um novo membro
export const create: RequestHandler = async (req, res) => {
  try {
    const { nome, congregacaoId } = req.body;

    if (!nome || !congregacaoId) {
      res.status(400).json({ error: 'Nome e congregacaoId são obrigatórios.' });
      return;
    }

    const member = await prisma.member.create({
      data: {
        nome,
        congregacaoId: Number(congregacaoId)
      }
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Lista membros, opcionalmente filtrando por congregacaoId
export const list: RequestHandler = async (req, res) => {
  try {
    const { congregacaoId } = req.query;

    const where: any = {};
    if (congregacaoId) {
      where.congregacaoId = Number(congregacaoId);
    }

    const members = await prisma.member.findMany({
      where,
      select: {
        id: true,
        nome: true,
        congregacaoId: true
      }
    });

    res.json(members);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};