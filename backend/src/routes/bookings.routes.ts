import express from 'express';
import { prisma } from '../index.ts';

const router = express.Router();

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  const { userId, showId, seats } = req.body;

  if (!userId || !showId || !seats || seats.length === 0) {
    return res.status(400).json({ message: 'Missing required booking information.' });
  }

  // Optional: Add a check to prevent over-booking
  if (seats.length > 6) {
    return res.status(400).json({ message: 'Cannot book more than 6 seats.' });
  }

  try {
    // Check for existing bookings to prevent double booking
    const existingBookings = await prisma.booking.findMany({
      where: {
        showId: showId,
        seats: {
          hasSome: seats
        }
      }
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({ message: 'One or more of the selected seats are already booked.' });
    }

    // Create the booking
    const newBooking = await prisma.booking.create({
      data: {
        userId: userId,
        showId: showId,
        seats: seats,
      },
    });

    res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
  } catch (error) {
    console.error('Failed to create booking:', error);
    res.status(500).json({ message: 'Failed to create booking.' });
  }
});


// GET /api/bookings/show/:showId - Get bookings for a show, separated by current user
router.get('/show/:showId', async (req, res) => {
  const { showId } = req.params;
  const userId = req.userId; // Get userId from the JWT payload

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. User ID not found in token.' });
  }

  try {
    const allBookingsForShow = await prisma.booking.findMany({
      where: {
        showId: parseInt(showId),
      },
      select: {
        userId: true,
        seats: true,
      },
    });

    // Separate bookings into two lists
    const userBookings: string[] = [];
    const otherBookings: string[] = [];

    allBookingsForShow.forEach(booking => {
      if (booking.userId === userId) {
        userBookings.push(...booking.seats);
      } else {
        otherBookings.push(...booking.seats);
      }
    });

    res.status(200).json({
      userBookings: userBookings,
      otherBookings: otherBookings
    });

  } catch (error) {
    console.error('Failed to fetch bookings for show:', error);
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
});

export default router;
