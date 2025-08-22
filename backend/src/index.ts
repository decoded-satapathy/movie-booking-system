import express from 'express';
import type { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import cinemaRoutes from './routes/cinemas.ts';
import movieRoutes from './routes/movies.ts';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient();

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Movie Booking API!');
});

// A simple test route to verify the database connection
app.get('/test-db', async (req: Request, res: Response) => {
  try {
    // A simple query to check if the database is reachable
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ message: 'Database connection successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database connection failed.', error: error });
  }
});

app.use('/api/cinemas', cinemaRoutes);
app.use('/api/movies', movieRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export { prisma };
