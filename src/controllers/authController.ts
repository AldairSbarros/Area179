import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, perfil, congregacaoId } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hashedPassword, perfil, congregacaoId }
    });
    res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(senha, usuario.senha);
    if (!valid) return res.status(401).json({ error: 'Senha inválida' });

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil, congregacaoId: usuario.congregacaoId },
      process.env.JWT_SECRET || 'segredo',
      { expiresIn: '7d' }
    );
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};