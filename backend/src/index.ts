import express from 'express';
import type { Express } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupSocketIO } from './socket.ts';
import cors from 'cors';

import authRoutes from './routes/auth.routes.ts';
import cinemaRoutes from './routes/cinemas.routes.ts';
import movieRoutes from './routes/movies.routes.ts';
import bookingRoutes from './routes/bookings.routes.ts';
import userRoutes from './routes/users.routes.ts';
import authMiddleware from './middleware/auth.middleware.ts';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    // origin: 'http://localhost:5173', // Replace with your frontend URL
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

// Initialize Prisma Client
export const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Public Routes (No authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/movies', movieRoutes);

// Protected Routes (Authentication required)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);

// A simple test route to verify the database connection
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database connection failed.', error: error });
  }
});

// Start the server
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
