import { useState, useCallback, useMemo } from 'react'; // 🎯 เพิ่ม useMemo
import useSWR from 'swr';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types';
import toast from 'react-hot-toast';

export const useBookings = (isAdmin: boolean = false) => {
    // 🎯 1. ใช้ Key ที่สื่อสารกับ Fetcher ชัดเจน
    const key = isAdmin ? ['/bookings/all-bookings', 'admin'] : ['/bookings/myBookings', 'user'];

    const { data: response, error, isLoading, mutate: mutateBookings } = useSWR(
        key,
        async ([url, role]) => {
            if (role === 'admin') {
                // 🎯 เรียก getAll ที่พู่กันเขียนไว้ให้ดึง 1000 รายการ (เพื่อ Stats ใน Dashboard)
                return await bookingService.getAll(true);
            }
            return await bookingService.getMyBookings(1, 100);
        },
        {
            refreshInterval: 5000, 
            revalidateOnFocus: true,
        }
    );

    // 🎯 2. แกะ Data ให้เป็น Array แน่นอน 100%
    const bookings: Booking[] = useMemo(() => {
        // ถ้า response เป็น Object ที่มี .data (จาก Interceptor) หรือเป็น Array อยู่แล้ว
        const raw = (response as any)?.data || response;
        return Array.isArray(raw) ? raw : [];
    }, [response]);

    const [actionLoading, setActionLoading] = useState(false);

    const updateStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            await bookingService.updateStatus(id, status);
            await mutateBookings();
            toast.success(`Status updated to ${status}`);
            return true;
        } catch (error: any) {
            toast.error('Update failed');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        bookings, // ตัวเลข Dashboard จะขยับจากตัวนี้
        loading: isLoading || actionLoading,
        mutateBookings,
        updateStatus
    };
};