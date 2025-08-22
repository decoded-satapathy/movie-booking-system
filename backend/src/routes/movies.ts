import express from 'express';
import { prisma } from '../index.ts';

const router = express.Router();

// GET /api/movies - Get a list of all movies
router.get('/', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies.' });
  }
});

// GET /api/movies/by-cinema/:cinemaId - Get movies and their showtimes for a specific cinema
router.get('/by-cinema/:cinemaId', async (req, res) => {
  const { cinemaId } = req.params;

  try {
    const moviesWithShowtimes = await prisma.movie.findMany({
      where: {
        shows: {
          some: {
            screen: {
              cinemaId: parseInt(cinemaId)
            }
          }
        }
      },
      include: {
        shows: {
          where: {
            screen: {
              cinemaId: parseInt(cinemaId)
            }
          },
          include: {
            screen: true
          }
        }
      }
    });

    res.status(200).json(moviesWithShowtimes);
  } catch (error) {
    console.error('Failed to fetch movies and showtimes for cinema:', error);
    res.status(500).json({ message: 'Failed to fetch movies and showtimes for cinema.' });
  }
});

export default router;
