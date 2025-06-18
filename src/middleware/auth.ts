// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// interface DecodedToken {
//   id: number;
//   perfil: string;
//   congregacaoId?: number;
//   iat?: number;
//   exp?: number;
// }

// export default function authMiddleware(perfisPermitidos: string[] = []) {
//   return (req: Request & { user?: DecodedToken }, res: Response, next: NextFunction): void => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       res.status(401).json({ error: 'Token não fornecido' });
//       return;
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       res.status(401).json({ error: 'Token inválido' });
//       return;
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo') as DecodedToken;
//       req.user = decoded;

//       if (perfisPermitidos.length && !perfisPermitidos.includes(decoded.perfil)) {
//         res.status(403).json({ error: 'Acesso negado para este perfil' });
//         return;
//       }

//       next();
//     } catch (err) {
//       res.status(401).json({ error: 'Token inválido ou expirado' });
//       return;
//     }
//   };
// }

import { Request, Response, NextFunction } from 'express';

// Middleware que permite tudo (NÃO faz autenticação)
export default function authMiddleware(_perfisPermitidos: string[] = []) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
}