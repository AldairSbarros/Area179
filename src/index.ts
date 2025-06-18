import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// Importação dos módulos de rotas
import congregacaoRoutes from './routes/congregacaoRoutes';
import memberRoutes from './routes/memberRoutes';
import offeringRoutes from './routes/offeringRoutes';
// import relatorioRoutes from './routes/relatorioRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
// import docRoutes from './routes/docRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/congregacoes', congregacaoRoutes);
app.use('/membros', memberRoutes);
app.use('/ofertas', offeringRoutes);
// app.use('/relatorios', relatorioRoutes);
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/usuarios', usuarioRoutes);
app.use('/dashboard', dashboardRoutes);
// app.use('/docs', docRoutes);
app.use('/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('API a179 rodando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});