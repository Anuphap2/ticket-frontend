import api from '@/lib/axios';
import { User } from '@/types';
import { API_PATHS } from '@/lib/constants';

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get(API_PATHS.users.base);
        return response.data?.data ?? response.data ?? [];
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(API_PATHS.users.byId(id));
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(API_PATHS.users.byId(id));
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await api.patch(API_PATHS.users.byId(id), data);
        return response.data;
    },
};