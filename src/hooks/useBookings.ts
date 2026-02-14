import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export const useBookings = (isAdmin: boolean = false) => {
    // Only fetch all bookings if admin, otherwise don't auto-fetch in this hook (or separate hook)
    // For now, we'll assume this hook is used in Admin context if isAdmin is true

    const key = isAdmin ? '/bookings' : null;

    const { data: bookings = [], error, isLoading, mutate: mutateBookings } = useSWR<Booking[]>(
        key,
        bookingService.getAll,
        {
            refreshInterval: 5000,
            shouldRetryOnError: false // prevent spamming if endpoint doesn't exist
        }
    );

    const [loading, setLoading] = useState(false);

    const updateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
        setLoading(true);
        try {
            await bookingService.updateStatus(id, status);
            mutateBookings();
            toast.success(`Booking ${status}`);
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        bookings,
        loading: isLoading || loading,
        mutateBookings,
        updateStatus
    };
};
