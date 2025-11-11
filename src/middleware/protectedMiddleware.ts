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

    fetch(process.env.USER_SERVICE_URL + '/auth/token/introspect', {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
      
    }).then(response => {

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return response.json();

    }).then(data => {
      
      (req as any).user = data.user;
      next();
      
    }).catch(error => {
      return res.status(401).json({ status: 401, message: '❌ Não autorizado: token inválido.' });
    });

}