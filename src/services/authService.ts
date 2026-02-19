import api from '@/lib/axios';
import { User } from '@/types';

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

export const authService = {
    login: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/signin', data);
        return response.data;
    },

    register: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },

    getProfile: async (token: string): Promise<User> => {
        const response = await api.get('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.patch('/auth/profile', data);
        return response.data;
    },

    logout: async () => {
        // API call if backend supports it, otherwise just client side
        try {
            await api.get('/auth/logout');
        } catch (e) {
            // ignore error on logout
        }
    }
};
