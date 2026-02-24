import api from '@/lib/axios';
import { API_PATHS } from '@/lib/constants';

export interface CreateIntentResponse {
    clientSecret: string;
}

export const paymentService = {
    createIntent: async (
        bookingId: string,
        amount: number,
    ): Promise<CreateIntentResponse> => {
        const response = await api.post(API_PATHS.payments.createIntent, {
            amount,
            bookingId,
        });
        return response.data;
    },
};
