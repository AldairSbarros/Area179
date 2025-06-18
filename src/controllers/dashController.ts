import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const resumoFinanceiro = async (req: Request, res: Response) => {
  try {
    let { congregacaoId, ano, mes } = req.query;
    if (!congregacaoId || !ano) {
      return res.status(400).json({ error: 'Informe congregacaoId e ano' });
    }

    // Aceita múltiplos IDs separados por vírgula
    const ids = String(congregacaoId).split(',').map(Number);

    // Define intervalo de datas
    let dataInicio: Date, dataFim: Date;
    if (mes) {
      dataInicio = new Date(Number(ano), Number(mes) - 1, 1);
      dataFim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
    } else {
      dataInicio = new Date(Number(ano), 0, 1);
      dataFim = new Date(Number(ano), 11, 31, 23, 59, 59);
    }

    let resumoPorCongregacao: any[] = [];
    let totalDizimosGeral = 0;
    let totalOfertasGeral = 0;

    for (const id of ids) {
      // Busca nome da congregação
      const congregacao = await prisma.congregacao.findUnique({
        where: { id },
        select: { nome: true }
      });

      // Busca dízimos
      const dizimos = await prisma.offering.findMany({
        where: {
          congregacaoId: id,
          type: 'dizimo',
          date: { gte: dataInicio, lte: dataFim }
        },
        include: {
          Member: { select: { nome: true } }
        }
      });

      // Busca ofertas
      const ofertas = await prisma.offering.findMany({
        where: {
          congregacaoId: id,
          type: 'oferta',
          date: { gte: dataInicio, lte: dataFim }
        },
        include: {
          Member: { select: { nome: true } }
        }
      });

      // Monta listas detalhadas
      const dizimosDetalhados = dizimos.map(d => ({
        nomeDizimista: d.Member?.nome || 'Desconhecido',
        valor: d.value,
        data: d.date,
        congregacao: congregacao?.nome || 'Desconhecida'
      }));

      const ofertasDetalhadas = ofertas.map(o => ({
        nomeOfertante: o.Member?.nome || 'Desconhecido',
        valor: o.value,
        data: o.date,
        culto: o.service,
        congregacao: congregacao?.nome || 'Desconhecida'
      }));

      // Somas
      const somaDizimos = dizimos.reduce((acc, d) => acc + d.value, 0);
      const somaOfertas = ofertas.reduce((acc, o) => acc + o.value, 0);
      const total = somaDizimos + somaOfertas;
      const comissao = total * 0.33;
      const recolhimento = total * 0.67;

      totalDizimosGeral += somaDizimos;
      totalOfertasGeral += somaOfertas;

      resumoPorCongregacao.push({
        congregacaoId: id,
        congregacaoNome: congregacao?.nome || 'Desconhecida',
        periodo: mes ? `${mes.toString().padStart(2, '0')}/${ano}` : `${ano}`,
        dizimos: dizimosDetalhados,
        ofertas: ofertasDetalhadas,
        somaDizimos,
        somaOfertas,
        total,
        comissao: Number(comissao.toFixed(2)),
        recolhimento: Number(recolhimento.toFixed(2))
      });
    }

    // Resumo geral
    const totalGeral = totalDizimosGeral + totalOfertasGeral;
    const comissaoGeral = totalGeral * 0.33;
    const recolhimentoGeral = totalGeral * 0.67;

    res.json({
      resumoPorCongregacao,
      resumoGeral: {
        somaDizimos: totalDizimosGeral,
        somaOfertas: totalOfertasGeral,
        total: totalGeral,
        comissao: Number(comissaoGeral.toFixed(2)),
        recolhimento: Number(recolhimentoGeral.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Erro ao obter resumo financeiro:', error);
    res.status(500).json({ error: 'Erro ao obter resumo financeiro' });
  }
};