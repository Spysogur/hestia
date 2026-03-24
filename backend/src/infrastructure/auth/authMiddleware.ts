import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function createAuthMiddleware(jwtService: JwtService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const token = authHeader.substring(7);
    try {
      req.user = jwtService.verify(token);
      next();
    } catch {
      res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }
  };
}
