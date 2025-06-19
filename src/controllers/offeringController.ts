import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const create = async (req: Request, res: Response) => {
  try {
    const { memberId, congregacaoId, type, value, date, service, receiptPhoto, numeroRecibo } = req.body;
    const offering = await prisma.offering.create({
      data: {
        memberId,
        congregacaoId,
        type,
        value,
        date: new Date(date),
        service,
        receiptPhoto,
        numeroRecibo
      }
    });
    res.status(201).json(offering);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const { congregacaoId, memberId, type, mes, ano } = req.query;
    const where: any = {};
    if (congregacaoId) where.congregacaoId = Number(congregacaoId);
    if (memberId) where.memberId = Number(memberId);
    if (type) where.type = String(type);

    // Filtro por mês e ano
    if (mes && ano) {
      const inicio = new Date(Number(ano), Number(mes) - 1, 1);
      const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
      where.date = { gte: inicio, lte: fim };
    }

    const offerings = await prisma.offering.findMany({
      where,
      include: { Member: true, Congregacao: true }
    });
    res.json(offerings);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateReceiptPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receiptPhoto } = req.body;

    const offering = await prisma.offering.update({
      where: { id: Number(id) },
      data: { receiptPhoto }
    });

    res.json(offering);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteReceiptPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offering = await prisma.offering.findUnique({ where: { id: Number(id) } });
    if (!offering || !offering.receiptPhoto) {
      return res.status(404).json({ error: 'Comprovante não encontrado' });
    }

    // Remove o arquivo do disco
    const filePath = path.resolve(__dirname, '../../', offering.receiptPhoto);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Limpa o campo no banco
    await prisma.offering.update({
      where: { id: Number(id) },
      data: { receiptPhoto: null }
    });

    res.json({ message: 'Comprovante removido com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listReceipts = async (req: Request, res: Response) => {
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

    res.json(comprovantes);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};