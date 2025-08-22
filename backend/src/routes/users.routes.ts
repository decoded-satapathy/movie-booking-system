import express from 'express';
import { prisma } from '../index.ts';

const router = express.Router();

// POST /api/users/register - Register a new user
router.post('/register', async (req, res) => {
  console.log(req.body);
  const { name, email } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Failed to register user:', error);
    res.status(500).json({ message: 'Failed to register user.' });
  }
});

export default router;
