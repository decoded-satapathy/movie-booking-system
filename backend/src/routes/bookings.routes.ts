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

export default router;
