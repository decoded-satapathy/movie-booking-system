import { Socket, type ExtendedError } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface CustomSocket extends Socket {
  userId: number;
  showId?: number | null;
}

const socketAuthMiddleware = (socket: CustomSocket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.headers.authorization?.split(" ")[1] || undefined;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    console.log("Some error occured");
    return next(new Error('Authentication error: Token or secret missing.'));
  }

  try {
    const decodedToken = jwt.verify(token, secret) as { userId: number };
    socket.userId = decodedToken.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token.'));
  }
};

export default socketAuthMiddleware;
