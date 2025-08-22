import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create Cinemas
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'PVR Cinemas',
      location: 'New Delhi',
    },
  });

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'INOX Cinemas',
      location: 'Mumbai',
    },
  });

  console.log('Created cinemas:', { cinema1, cinema2 });

  // Create Screens for Cinemas
  const screen1_c1 = await prisma.screen.create({
    data: {
      name: 'Screen 1',
      cinemaId: cinema1.id,
    },
  });

  const screen2_c1 = await prisma.screen.create({
    data: {
      name: 'Screen 2',
      cinemaId: cinema1.id,
    },
  });

  const screen1_c2 = await prisma.screen.create({
    data: {
      name: 'Screen A',
      cinemaId: cinema2.id,
    },
  });

  console.log('Created screens:', { screen1_c1, screen2_c1, screen1_c2 });

  // Create Movies
  const movie1 = await prisma.movie.create({
    data: {
      title: 'The Great Adventure',
      description: 'A thrilling movie about an epic quest.',
      posterUrl: 'https://example.com/poster1.jpg',
    },
  });

  const movie2 = await prisma.movie.create({
    data: {
      title: 'City Lights',
      description: 'A charming romantic comedy.',
      posterUrl: 'https://example.com/poster2.jpg',
    },
  });

  console.log('Created movies:', { movie1, movie2 });

  // Create Shows
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Show 1: The Great Adventure at PVR Screen 1 (tomorrow 10 AM)
  const show1 = await prisma.show.create({
    data: {
      showtime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
      price: 150.00,
      movieId: movie1.id,
      screenId: screen1_c1.id,
    },
  });

  // Show 2: City Lights at PVR Screen 2 (tomorrow 3 PM)
  const show2 = await prisma.show.create({
    data: {
      showtime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
      price: 120.00,
      movieId: movie2.id,
      screenId: screen2_c1.id,
    },
  });

  // Show 3: The Great Adventure at INOX Screen A (tomorrow 7 PM)
  const show3 = await prisma.show.create({
    data: {
      showtime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 0),
      price: 180.00,
      movieId: movie1.id,
      screenId: screen1_c2.id,
    },
  });

  console.log('Created shows:', { show1, show2, show3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
