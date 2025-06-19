import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cria um novo membro usando o nome da congregação
export const create: RequestHandler = async (req, res) => {
  try {
    const { nome, congregacaoNome, telefone, email, senha } = req.body;

    if (!nome || !congregacaoNome) {
      res.status(400).json({ error: 'Nome e congregacaoNome são obrigatórios.' });
      return;
    }

    // Busca a congregação pelo nome
    const congregacao = await prisma.congregacao.findFirst({
      where: { nome: congregacaoNome }
    });

    if (!congregacao) {
      res.status(404).json({ error: 'Congregação não encontrada.' });
      return;
    }

    const member = await prisma.member.create({
      data: {
        nome,
        congregacaoId: congregacao.id,
        telefone,
        email,
        senha
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