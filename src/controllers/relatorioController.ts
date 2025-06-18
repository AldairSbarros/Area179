import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

type DizimoGroup = {
  memberId: number;
  _sum: { value: number | null };
};

type Member = {
  id: number;
  name: string;
};

type Oferta = {
  id: number;
  memberId: number;
  congregacaoId: number;
  type: string;
  value: number;
  date: Date;
  service: string;
  receiptPhoto?: string | null;
};

type RelatorioMensalData = {
  listaDizimistas: { memberId: number; nome: string; valor: number }[];
  ofertas: Oferta[];
  ofertasPorCulto: Record<string, Oferta[]>;
  somaPorCulto: Record<string, number>;
  totalDizimos: number;
  totalOfertas: number;
  totalArrecadado: number;
  comissao: number;
  paraCentral: number;
};

async function getRelatorioMensalData(
  congregacaoId: string | number,
  mes: string | number,
  ano: string | number
): Promise<RelatorioMensalData> {
  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);

  // Dízimos por membro
  const dizimos: DizimoGroup[] = await prisma.offering.groupBy({
    by: ['memberId'],
    where: {
      congregacaoId: Number(congregacaoId),
      type: 'dizimo',
      date: { gte: inicio, lte: fim }
    },
    _sum: { value: true }
  });

  // Buscar nomes dos membros
  const memberIds = dizimos.map(d => d.memberId).filter(Boolean);
  const members: Member[] = await prisma.member.findMany({
    where: { id: { in: memberIds } }
  });

  // Ofertas detalhadas
  const ofertas: Oferta[] = await prisma.offering.findMany({
    where: {
      congregacaoId: Number(congregacaoId),
      type: 'oferta',
      date: { gte: inicio, lte: fim }
    }
  });

  // Agrupar ofertas por culto
  const ofertasPorCulto: Record<string, Oferta[]> = {};
  ofertas.forEach(oferta => {
    if (!ofertasPorCulto[oferta.service]) {
      ofertasPorCulto[oferta.service] = [];
    }
    ofertasPorCulto[oferta.service].push(oferta);
  });

  // Soma das ofertas por culto
  const somaPorCulto: Record<string, number> = {};
  Object.keys(ofertasPorCulto).forEach(culto => {
    somaPorCulto[culto] = ofertasPorCulto[culto].reduce((acc, o) => acc + o.value, 0);
  });

  // Totais
  const totalDizimos = dizimos.reduce((acc, d) => acc + (d._sum.value || 0), 0);
  const totalOfertas = ofertas.reduce((acc, o) => acc + o.value, 0);
  const totalArrecadado = totalDizimos + totalOfertas;
  const comissao = totalArrecadado * 0.33;
  const paraCentral = totalArrecadado * 0.67;

  // Montar lista de dizimistas
  const listaDizimistas = dizimos.map(d => {
    const membro = members.find(m => m.id === d.memberId);
    return {
      memberId: d.memberId,
      nome: membro ? membro.name : 'Desconhecido',
      valor: d._sum.value || 0
    };
  });

  return {
    listaDizimistas,
    ofertas,
    ofertasPorCulto,
    somaPorCulto,
    totalDizimos,
    totalOfertas,
    totalArrecadado,
    comissao,
    paraCentral
  };
}

export const relatorioMensal = async (req: Request, res: Response) => {
  try {
    const { mes, ano } = req.query;
    let { congregacaoId } = req.query as { congregacaoId?: string };

    // Se não for pastor ou admin, força o congregacaoId do usuário
    if ((req as any).user?.perfil !== 'pastor' && (req as any).user?.perfil !== 'admin') {
      congregacaoId = (req as any).user?.congregacaoId;
    }

    if (!congregacaoId || !mes || !ano) {
      return res.status(400).json({ error: 'Informe congregacaoId, mes e ano' });
    }

    const data = await getRelatorioMensalData(
      String(congregacaoId),
      String(mes),
      String(ano)
    );

    res.json({
      dizimistas: data.listaDizimistas,
      ofertasDetalhadas: data.ofertas,
      ofertasPorCulto: data.ofertasPorCulto,
      somaOfertasPorCulto: data.somaPorCulto,
      totalDizimos: data.totalDizimos,
      totalOfertas: data.totalOfertas,
      totalArrecadado: data.totalArrecadado,
      comissao33: data.comissao,
      paraCentral67: data.paraCentral
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const relatorioMensalPDF = async (req: Request, res: Response) => {
  try {
    const { mes, ano } = req.query;
    let { congregacaoId } = req.query as { congregacaoId?: string };

    // Se não for pastor ou admin, força o congregacaoId do usuário
    if ((req as any).user?.perfil !== 'pastor' && (req as any).user?.perfil !== 'admin') {
      congregacaoId = (req as any).user?.congregacaoId;
    }

    if (!congregacaoId || !mes || !ano) {
      return res.status(400).json({ error: 'Informe congregacaoId, mes e ano' });
    }

    const data = await getRelatorioMensalData(
      String(congregacaoId),
      String(mes),
      String(ano)
    );

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Relatório Mensal de Tesouraria', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Mês: ${mes}/${ano}`);
    doc.text(`Congregação: ${congregacaoId}`);
    doc.moveDown();

    doc.fontSize(12).text('Dizimistas:');
    data.listaDizimistas.forEach(d => {
      doc.text(`- ${d.nome}: R$ ${d.valor.toFixed(2)}`);
    });
    doc.moveDown();

    doc.text('Ofertas por Culto:');
    Object.keys(data.somaPorCulto).forEach(culto => {
      doc.text(`- ${culto}: R$ ${data.somaPorCulto[culto].toFixed(2)}`);
    });
    doc.moveDown();

    doc.text(`Total de Dízimos: R$ ${data.totalDizimos.toFixed(2)}`);
    doc.text(`Total de Ofertas: R$ ${data.totalOfertas.toFixed(2)}`);
    doc.text(`Total Arrecadado: R$ ${data.totalArrecadado.toFixed(2)}`);
    doc.text(`Comissão 33%: R$ ${data.comissao.toFixed(2)}`);
    doc.text(`Para Central 67%: R$ ${data.paraCentral.toFixed(2)}`);

    doc.end();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};