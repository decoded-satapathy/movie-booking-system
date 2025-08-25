import { Cinema, Movie, PrismaClient, Screen, Show } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

// Helper function to generate unique image URLs
const getMovieImageUrl = (id: number): string => `https://picsum.photos/200/300?random=${id}`;

async function main() {
  console.log('Start seeding...');

  // Create a sample admin user with a password
  const hashedPassword = await bcrypt.hash('password', saltRounds);

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Normal User',
      password: hashedPassword,
    },
  });

  console.log('Created users:', { normalUser });

  const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'];

  const cinemas: Cinema[] = [];
  for (const city of cities) {
    for (let i = 1; i <= 3; i++) {
      const cinema = await prisma.cinema.create({
        data: {
          name: `Cinema ${i} ${city}`,
          location: city,
        },
      });
      cinemas.push(cinema);
      console.log(`Created cinema: ${cinema.name}`);
    }
  }

  const movies: Movie[] = [];
  for (let i = 1; i <= 10; i++) {
    const movie = await prisma.movie.create({
      data: {
        title: `Movie Title ${i}`,
        description: `This is a movie description for movie number ${i}.`,
        posterUrl: getMovieImageUrl(i),
      },
    });
    movies.push(movie);
  }
  console.log(`Created ${movies.length} movies`);

  const screens: Screen[] = [];
  for (const cinema of cinemas) {
    for (let i = 1; i <= 4; i++) {
      const screen = await prisma.screen.create({
        data: {
          name: `Screen ${i}`,
          cinemaId: cinema.id,
        },
      });
      screens.push(screen);
    }
  }
  console.log(`Created ${screens.length} screens`);

  const showtimes = [10, 13, 16, 19, 22]; // 10 AM, 1 PM, 4 PM, 7 PM, 10 PM
  const prices = [150.00, 180.00, 200.00];

  const shows: Show[] = [];
  const startDate = new Date('2025-08-25');
  const endDate = new Date('2025-08-30');

  for (const screen of screens) {
    // Each screen will show 2 movies
    const randomMovies = movies.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const movie of randomMovies) {
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        for (const time of showtimes) {
          const show = await prisma.show.create({
            data: {
              showtime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), time, 0),
              price: prices[Math.floor(Math.random() * prices.length)] || 100,
              movieId: movie.id,
              screenId: screen.id,
            },
          });
          shows.push(show);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }
  console.log(`Created ${shows.length} shows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
