import express from 'express';
import { prisma } from '../index.ts'; // Import the prisma client from our main server file

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log("/api/cinemas");
    const cinemas = await prisma.cinema.findMany();
    res.status(200).json(cinemas);
  } catch (error) {
    console.error('Failed to fetch cinemas:', error);
    res.status(500).json({ message: 'Failed to fetch cinemas.' });
  }
});

export default router;
