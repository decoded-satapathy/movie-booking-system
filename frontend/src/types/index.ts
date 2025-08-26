export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Cinema {
  id: number;
  name: string;
  location: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  shows?: Show[];
}

export interface Show {
  id: number;
  showtime: string;
  price: string;
  movieId: number;
  screenId: number;
  screen: {
    id: number;
    name: string;
    cinemaId: number;
    cinema: Cinema;
  };
  movie?: Movie;
  userBookings: string[];
  otherBookings: string[];
}

export interface Booking {
  id: number;
  userId: number;
  showId: number;
  seats: string[];
  bookingTime: string;
  show: Show;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface BookingRequest {
  userId: number;
  showId: number;
  seats: string[];
}
