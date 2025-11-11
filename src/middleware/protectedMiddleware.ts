import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


export const protectedMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const header = req.headers.authorization;
    
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ status: 401, message: '❌ Não autorizado: token ausente ou inválido.' });
    }
    
    const token = header.split(' ')[1];

    if(!token) {
      return res.status(401).json({ status: 401, message: '❌Não autorizado: token ausente.' });
    }

    (async () => {
      // Primary introspect endpoint
      const base = process.env.USER_SERVICE_URL || '';
      const tryEndpoints = [
        `${base}/auth/token/introspect`,
        `${base}/validate-token`,
        `${base}/auth/validate-token`,
        `${base}/auth/token/validate`
      ];

      let lastError: any = null;
      for (const url of tryEndpoints) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });

          if (!response.ok) {
            lastError = new Error(`Status ${response.status} from ${url}`);
            continue; // try next endpoint
          }

          const data: any = await response.json();
          // Support different shapes: { user }, { _id, email, role }, or { user: { ... } }
          const user = data.user ? data.user : (data._id ? data : null);
          if (!user) {
            lastError = new Error(`Invalid user payload from ${url}`);
            continue;
          }

          (req as any).user = user;
          return next();
        } catch (err) {
          lastError = err;
          // try next
        }
      }

      console.error('protectedMiddleware: all user-service endpoints failed', lastError);
      return res.status(401).json({ status: 401, message: '❌ Não autorizado: token inválido.' });
    })();

}