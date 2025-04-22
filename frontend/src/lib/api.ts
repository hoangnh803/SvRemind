// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export interface LoginResponse {
  access_token: string;
  user: {
    role: string;
    email: string;
  };
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data as LoginResponse;
};