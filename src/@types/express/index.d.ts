import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      id: number;
      perfil: string;
      congregacaoId?: number;
      iat?: number;
      exp?: number;
    };
  }
}