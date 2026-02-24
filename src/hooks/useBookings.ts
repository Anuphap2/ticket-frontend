'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { bookingService } from '@/services/bookingService';
import { Booking, CreateBookingDto } from '@/types';
import toast from 'react-hot-toast';

export const useBookings = (isAdmin = false) => {
    const key = isAdmin
        ? ['/bookings/all-bookings', 'admin']
        : ['/bookings/myBookings', 'user'];

    const {
        data: response,
        error,
        isLoading,
        mutate: mutateBookings,
    } = useSWR(
        key,
        async ([, role]) => {
            if (role === 'admin') return bookingService.getAllFlat();
            return bookingService.getMyBookings(1, 100);
        },
        { refreshInterval: 5000, revalidateOnFocus: true },
    );

    // Normalise to always be Booking[]
    const bookings: Booking[] = useMemo(() => {
        const raw = (response as any)?.data ?? response;
        return Array.isArray(raw) ? raw : [];
    }, [response]);

    const [actionLoading, setActionLoading] = useState(false);

    // ─── Double-booking lock ──────────────────────────────────────────────────
    // useRef so the lock is synchronously readable without a re-render cycle.
    const isSubmitting = useRef(false);

    const createBooking = useCallback(
        async (data: CreateBookingDto) => {
            if (isSubmitting.current) {
                toast.error('Already processing your booking — please wait');
                return null;
            }
            isSubmitting.current = true;
            setActionLoading(true);
            try {
                const result = await bookingService.create(data);
                await mutateBookings();
                return result;
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Booking failed');
                return null;
            } finally {
                isSubmitting.current = false;
                setActionLoading(false);
            }
        },
        [mutateBookings],
    );

    const updateStatus = async (id: string, status: string): Promise<boolean> => {
        setActionLoading(true);
        try {
            await bookingService.updateStatus(id, status);
            await mutateBookings();
            toast.success(`Status updated to ${status}`);
            return true;
        } catch {
            toast.error('Update failed');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        bookings,
        error,
        loading: isLoading || actionLoading,
        isLoading,
        actionLoading,
        mutateBookings,
        createBooking,
        updateStatus,
    };
};