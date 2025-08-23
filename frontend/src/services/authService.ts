import { api } from './api';
import { AuthResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },
};