import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const create = async (req: Request, res: Response) => {
  try {
    const { nome, endereco, telefone } = req.body;
    const congregacao = await prisma.congregacao.create({
      data: {
        nome
      }
    });
    res.status(201).json(congregacao);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar congregação' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const congregacoes = await prisma.congregacao.findMany();
    res.status(200).json(congregacoes);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar congregações' });
  }
};