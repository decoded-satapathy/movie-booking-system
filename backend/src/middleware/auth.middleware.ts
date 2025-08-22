import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Add a declaration to the Express Request object to include `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header is missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: 'Server configuration error: JWT secret not found.' });
  }

  try {
    if (!token) {
      return res.status(500).json({ message: 'Authorization header not sent' });
    }

    const decodedToken: any = jwt.verify(token, secret);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default authMiddleware;
