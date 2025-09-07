import { Request, Response, NextFunction } from 'express';
import { validateTokenUseCase } from '../config/di-config';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (
    req.path.startsWith('/api/health') ||
    req.path.startsWith('/api-docs')
  ) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não informado' });
  }
  const result = await validateTokenUseCase.execute(token);
  if (!result.valid) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  (req as any).context = { userId: result.decoded?.sub, token };
  return next();
}
