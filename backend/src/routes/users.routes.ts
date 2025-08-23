import express from 'express';
import { prisma } from '../index';

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

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
});

router.delete('/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.userId; // Get userId from the JWT payload

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. User ID not found in token.' });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      select: {
        id: true,
        userId: true,
        showId: true,
        seats: true,
        show: {
          select: {
            showtime: true,
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check for ownership
    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden. You can only cancel your own bookings.' });
    }

    // 2. Check if the showtime has already passed
    const showtime = new Date(booking.show.showtime);
    if (showtime < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel a booking for a show that has already started.' });
    }

    // 3. Delete the booking from the database
    await prisma.booking.delete({
      where: { id: booking.id },
    });

    // 4. Emit WebSocket event for each cancelled seat
    // @ts-ignore
    if (req.io) {
      booking.seats.forEach(seatId => {
        // @ts-ignore
        req.io?.to(`show-${booking.showId}`).emit('seatUnbooked', { seatId: seatId, showId: booking.showId });
      });
    }

    res.status(200).json({ message: 'Booking cancelled successfully.', bookingId: booking.id });
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking.' });
  }
});

export default router;
