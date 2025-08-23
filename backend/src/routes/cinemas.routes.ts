import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// GET /api/cinemas - Get a list of all cinemas, with optional city filter
router.get('/', async (req, res) => {
  const { city } = req.query;

  try {
    let whereClause = {};

    // Check if a city query parameter was provided
    if (city && typeof city === 'string') {
      whereClause = {
        location: {
          equals: city,
          mode: 'insensitive', // Case-insensitive search
        },
      };
    }

    const cinemas = await prisma.cinema.findMany({
      where: whereClause,
    });

    res.status(200).json(cinemas);
  } catch (error) {
    console.error('Failed to fetch cinemas:', error);
    res.status(500).json({ message: 'Failed to fetch cinemas.' });
  }
});

export default router;
