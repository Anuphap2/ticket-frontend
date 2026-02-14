import api from '@/lib/axios';
import { Event } from '@/types';

export const eventService = {
    getAll: async (): Promise<Event[]> => {
        const response = await api.get('/events');
        return response.data;
    },

    getById: async (id: string): Promise<Event> => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<Event> => {
        const response = await api.post('/events', data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<Event> => {
        const response = await api.patch(`/events/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/events/${id}`);
    }
};
