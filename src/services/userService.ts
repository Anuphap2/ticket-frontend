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
    }
};