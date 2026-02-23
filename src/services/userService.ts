import api from '@/lib/axios';
import { User } from '@/types';

export const userService = {
    getAll: async (): Promise<User[]> => {
        try {
            const response = await api.get('/users');
            return response.data?.data || response.data;
        } catch (error) {
            console.warn("Backend /users not found, using empty array");
            return []; // 🎯 คืนค่า Array ว่างไปก่อน หน้าเว็บจะไม่พังแต่ชื่อจะขึ้นเป็น Guest
        }
    },

    getById: async (id: string): Promise<User> => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await api.delete(`/users/${id}`);
        } catch (error) {
            console.error("Failed to delete user:", error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        try {
            const response = await api.patch(`/users/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Failed to update user:", error);
            throw error;
        }
    }
};