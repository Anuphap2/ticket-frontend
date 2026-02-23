import api from '@/lib/axios';
import { Event, Ticket, CreateEventDto } from '@/types';
import { API_PATHS } from '@/lib/constants';

export const eventService = {
    getAll: async (): Promise<Event[]> => {
        const response = await api.get(API_PATHS.events.base);
        return response.data;
    },

    getById: async (id: string): Promise<Event> => {
        const response = await api.get(API_PATHS.events.byId(id));
        return response.data;
    },

    // Moved here from event detail page — pages must not call api directly
    getTicketsByEvent: async (id: string): Promise<Ticket[]> => {
        const response = await api.get(API_PATHS.events.tickets(id));
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },

    create: async (data: CreateEventDto): Promise<Event> => {
        const response = await api.post(API_PATHS.events.base, data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateEventDto>): Promise<Event> => {
        const response = await api.patch(API_PATHS.events.byId(id), data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(API_PATHS.events.byId(id));
    },
};
