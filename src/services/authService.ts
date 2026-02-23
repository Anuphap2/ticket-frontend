import api from '@/lib/axios';
import { User, LoginDto, RegisterDto } from '@/types';
import { API_PATHS } from '@/lib/constants';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  login: async (data: LoginDto): Promise<AuthTokens> => {
    const response = await api.post(API_PATHS.auth.signin, data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthTokens> => {
    const response = await api.post(API_PATHS.auth.signup, data);
    return response.data;
  },

  getProfile: async (token?: string): Promise<User> => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await api.get(API_PATHS.auth.profile, config);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch(API_PATHS.auth.profile, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.get(API_PATHS.auth.logout);
    } catch {
      // Logout errors are non-fatal — local state is cleared regardless
    }
  },
};
