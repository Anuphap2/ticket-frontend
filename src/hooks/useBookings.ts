import { useState } from 'react';
import useSWR from 'swr';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export const useBookings = (isAdmin: boolean = false) => {
    // 🎯 1. ใช้ key ที่เราแยกไว้ตาม Role
    const key = isAdmin ? '/bookings/all-bookings' : '/bookings/myBookings';

    const { data: response, error, isLoading, mutate: mutateBookings } = useSWR(
        key,
        bookingService.getAll
    );

    // 🎯 3. แกะกล่องข้อมูลให้ถูกชั้น
    const bookings: Booking[] = (response as any)?.data || [];
    const [actionLoading, setActionLoading] = useState(false);

    const updateStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'pending') => {
        setActionLoading(true);
        try {
            await bookingService.updateStatus(id, status);
            // 🎯 เรียกใช้ mutate ที่ดึงออกมาจาก SWR
            mutateBookings();
            toast.success(`Booking ${status}`);
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        bookings,
        loading: isLoading || actionLoading,
        mutateBookings,
        updateStatus
    };
};