import axios from 'axios';

export const uploadService = {
    // 1. เพิ่ม parameter eventId เข้ามาตรงนี้ (ใส่ ? ไว้เพื่อให้ใช้ได้ทั้งตอนสร้างใหม่และแก้ไข)
    uploadImage: async (file: File, eventId?: string): Promise<string> => {
        if (!file) throw new Error('No file selected');

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('No access token found. Please login again.');
        }

        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // 2. *** จุดสำคัญ *** ต่อ Query String ถ้ามี eventId ส่งมา
        const url = eventId
            ? `${baseURL}/events/upload?eventId=${eventId}`
            : `${baseURL}/events/upload`;

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.data.url;
        } catch (error: any) {
            if (error.response) {
                console.error('Upload Error Details:', error.response.data);
            }
            throw error;
        }
    },
};