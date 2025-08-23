import express from 'express';
import type { Express } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupSocketIO } from './socket.ts';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes.ts';
import cinemaRoutes from './routes/cinemas.routes.ts';
import movieRoutes from './routes/movies.routes.ts';
import bookingRoutes from './routes/bookings.routes.ts';
import userRoutes from './routes/users.routes.ts';
import authMiddleware from './middleware/auth.middleware.ts';
import type { CustomSocket } from './middleware/socket.middleware.ts';

dotenv.config();

const strictApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const relaxedApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app: Express = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new SocketIOServer<any, any, any, CustomSocket>(server, {
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
app.use('/api/auth', strictApiLimiter, authRoutes);

// Protected Routes (Authentication required)

app.use(relaxedApiLimiter);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users', authMiddleware,
  (req, _, next) => {
    req.io = io;
    next();

  },
  userRoutes);
app.use('/api/bookings', authMiddleware, (req, _, next) => {
  req.io = io;
  next();

}, bookingRoutes);

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
