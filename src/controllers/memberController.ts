import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const create = async (req: Request, res: Response) => {
  try {
    const { nome, congregacaoId } = req.body;
    const member = await prisma.member.create({
      data: { nome, congregacaoId }
    });
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const { congregacaoId, mes, ano } = req.query;
    if (!congregacaoId) {
      return res.status(400).json({ error: 'Informe o congregacaoId' });
    }

    const where: any = {
      congregacaoId: Number(congregacaoId),
      receiptPhoto: { not: null }
    };

    if (mes && ano) {
      const inicio = new Date(Number(ano), Number(mes) - 1, 1);
      const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
      where.date = { gte: inicio, lte: fim };
    }

    const comprovantes = await prisma.offering.findMany({
      where,
      select: {
        id: true,
        memberId: true,
        value: true,
        date: true,
        service: true,
        receiptPhoto: true
      }
    });

    type Comprovante = {
      id: number;
      memberId: number;
      value: number;
      date: Date;
      service: string;
      receiptPhoto: string | null;
    };

    const result = comprovantes.map((c: Comprovante) => ({
      ...c
    }));
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};