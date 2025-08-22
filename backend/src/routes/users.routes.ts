import express from 'express';
import { prisma } from '../index.ts';

const router = express.Router();

// GET /api/users/:userId/bookings - Get a user's booking history
router.get('/:userId/bookings', async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        bookingTime: 'desc',
      },
      include: {
        show: {
          include: {
            movie: true,
            screen: {
              include: {
                cinema: true,
              },
            },
          },
        },
      },
    });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
});

export default router;
