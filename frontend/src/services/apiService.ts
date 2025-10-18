// frontend/src/services/apiService.ts
import apiClient from '../lib/api/client';  // ✅ مسیر جدید
import { AuthResponse, LoginData, RegisterData, User } from '../types/api';  // ✅ مسیر جدید

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  }
};