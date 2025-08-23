import { api } from './api';
import { Cinema, Movie, Show, Booking, BookingRequest } from '@/types';

export const movieService = {
  async getCinemas(city?: string): Promise<Cinema[]> {
    const params = city ? { city } : {};
    const response = await api.get('/api/cinemas', { params });
    return response.data;
  },

  async getMovies(): Promise<Movie[]> {
    const response = await api.get('/api/movies');
    return response.data;
  },

  async getMoviesByCinema(cinemaId: number): Promise<Movie[]> {
    const response = await api.get(`/api/movies/by-cinema/${cinemaId}`);
    return response.data;
  },

  async getShowDetails(showId: number): Promise<Show> {
    console.log("getting show details");
    const response1 = await api.get(`/api/movies/show/${showId}`);
    const response2 = await api.get(`/api/bookings/show/${showId}`);
    return {
      ...response1.data,
      ...response2.data
    };
  },

  async createBooking(booking: BookingRequest): Promise<Booking> {
    const response = await api.post('/api/bookings', booking);
    return response.data;
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    const response = await api.get(`/api/users/${userId}/bookings`);
    return response.data;
  },

  async cancelBooking(bookingId: string): Promise<void> {
    const response = await api.delete(`/api/users/${bookingId}`);
    console.log(response.data);
    return response.data;
  }
};
