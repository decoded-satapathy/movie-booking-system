import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import socketAuthMiddleware from './middleware/socket.middleware';
import type { CustomSocket } from './middleware/socket.middleware';
import { default as Redis } from 'ioredis';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "");

const getBlockedSeats = async (showId: string): Promise<string[]> => {
  const keys: string[] = await redis.keys(`show:${showId}:seat:*`);
  const blockedSeats = keys.map((key: string) => key.split(':').pop() || '');
  return blockedSeats;
};

export const setupSocketIO = (io: SocketIOServer<any, any, any, CustomSocket>) => {
  io.use(socketAuthMiddleware as any);

  io.on('connection', async (givenSocket) => {
    const socket = givenSocket as CustomSocket;
    const userId = socket.userId;
    socket.showId = null;

    console.log(`User connected with ID: ${userId} (${socket.id})`);

    socket.on('joinShow', async (showId: number) => {
      if (socket.showId) {
        socket.leave(`show-${socket.showId}`);
      }
      socket.join(`show-${showId}`);
      socket.showId = showId;

      const blockedSeats = await getBlockedSeats(showId.toString());
      socket.emit('initialBlockedSeats', blockedSeats);
    });

    socket.on('seatSelected', async (data: { showId: string, seatId: string }) => {
      const key = `show:${data.showId}:seat:${data.seatId}`;
      const value = userId.toString();
      const expirationTime = 300; // 5 mins in seconds

      const lockAcquired = await redis.set(key, value, 'NX');

      setTimeout(async () => {
        const isStillLocked = await redis.get(key);
        if (isStillLocked && parseInt(isStillLocked) === userId) {
          await redis.del(key);
          socket.to(`show-${data.showId}`).emit('seatUnblocked', data.seatId);
        }
      }, expirationTime * 1000);

      if (lockAcquired === 'OK') {
        socket.to(`show-${data.showId}`).emit('seatBlocked', data.seatId);
      } else {
        socket.emit('seatAlreadyBlocked', data.seatId);
      }
    });

    socket.on('seatDeselected', async (data: { showId: string, seatId: string }) => {
      const key = `show:${data.showId}:seat:${data.seatId}`;
      await redis.del(key);
      socket.to(`show-${data.showId}`).emit('seatUnblocked', data.seatId);
    });

    socket.on('disconnect', async () => {
      const showId = socket.showId;
      console.log(`User disconnected from show: ${showId}`);

      if (showId) {
        const keys = await redis.keys(`show:${showId}:seat:*`);
        const userLockedKeys = [];
        for (const key of keys) {
          const lockedUserId = await redis.get(key);
          if (lockedUserId && lockedUserId === userId?.toString()) {
            userLockedKeys.push(key);
          }
        }

        if (userLockedKeys.length > 0) {
          await redis.del(...userLockedKeys);
          console.log(`Cleared ${userLockedKeys.length} temporary seat locks for user: ${userId}`);
          userLockedKeys.forEach(key => {
            const seatId = key.split(':').pop();
            if (seatId) {
              socket.to(`show-${showId}`).emit('seatUnblocked', seatId);
            }
          });
        }
      }
    });
  });
};
