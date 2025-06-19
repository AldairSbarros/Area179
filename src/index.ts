import dotenv from 'dotenv';
dotenv.config();



import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

const app = express(); // Define o app ANTES de configurar o Swagger

app.use(cors());
app.use(express.json());

// Importação dos módulos de rotas
import congregacaoRoutes from './routes/congregacaoRoutes';
import memberRoutes from './routes/memberRoutes';
import offeringRoutes from './routes/offeringRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import authRoutes from './routes/authRoutes';
import despesaRoutes from './routes/despesaRoutes';
import receitaRoutes from './routes/receitaRoutes';
import investimentosRoutes from './routes/investimentosRoutes';

// Configuração do Swagger (garanta que o JSON está no lugar certo)
const swaggerDocument = require('./docs/swagger.json'); // Alternativa se import não funcionar
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da aplicação
app.use('/despesas', despesaRoutes);
app.use('/receitas', receitaRoutes);
app.use('/investimentos', investimentosRoutes);
app.use('/congregacoes', congregacaoRoutes);
app.use('/membros', memberRoutes);
app.use('/ofertas', offeringRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/auth', authRoutes);

// Rota pública para acesso aos arquivos de upload
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Rota base de status
app.get('/', (req: Request, res: Response) => {
  res.send('API a179 rodando');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});