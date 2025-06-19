import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const list = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, congregacaoId: true }
    });
    res.json(usuarios);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
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

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, congregacaoId } = req.body;
    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nome, email, perfil, congregacaoId }
    });
    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Redefinir senha (admin)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { senha: hashedPassword }
    });
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Trocar a própria senha
export const changePassword = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: hashedPassword }
    });

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDizimos = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const dizimos = await prisma.dizimo.findMany({
      where: { usuarioId: userId },
      select: { id: true, valor: true, data: true, comprovante: true }
    });

    res.json(dizimos);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const dizimos = await prisma.dizimo.findMany({
      where: { usuarioId: usuario.id },
      select: { id: true, valor: true, data: true, comprovante: true }
    });

    res.json({ usuario, dizimos });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadComprovante = async (req: Request, res: Response) => {
  try {
    const { dizimoId } = req.body;
    const file = req.file; // Arquivo enviado

    if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const imageUrl = `URL_DO_ARMAZENAMENTO/${file.filename}`; // Substitua pelo caminho real

    await prisma.dizimo.update({
      where: { id: Number(dizimoId) },
      data: { comprovante: imageUrl }
    });

    res.json({ message: 'Comprovante enviado com sucesso', imageUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};