import express from 'express';
import { prisma } from '../index.ts';

const router = express.Router();

router.get('/', async (_, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies.' });
  }
});

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

router.get('/show/:showId', async (req, res) => {
  const { showId } = req.params;

  try {
    const show = await prisma.show.findUnique({
      where: { id: parseInt(showId) },
      include: {
        bookings: {
          select: {
            seats: true,
          },
        },
      },
    });

    if (!show) {
      return res.status(404).json({ message: 'Show not found.' });
    }

    // Combine all booked seats from the bookings into a single array
    const bookedSeats: string[] = show.bookings.flatMap((booking) => booking.seats);

    // Return the show details along with the list of booked seats
    res.status(200).json({
      ...show,
      bookedSeats,
    });
  } catch (error) {
    console.error('Failed to fetch show details:', error);
    res.status(500).json({ message: 'Failed to fetch show details.' });
  }
});

export default router;
