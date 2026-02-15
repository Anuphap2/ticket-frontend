import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import toast from 'react-hot-toast';

export const useEvents = () => {
    // 1. ดึงข้อมูลผ่าน SWR
    const { data: response, error, isLoading, mutate: mutateEvents } = useSWR(
        '/events',
        eventService.getAll,
        {
            refreshInterval: 3000,
            revalidateOnFocus: true
        }
    );

    // 🎯 หัวใจสำคัญ: ดึง Array จริงๆ ออกมาจากโครงสร้างใหม่ { success: true, data: [...] }
    const events: Event[] = (Array.isArray(response) ? response : (response as any)?.data) || [];

    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // 2. ดึงข้อมูลรายอัน (Single Event)
    const fetchEvent = useCallback(async (id: string) => {
        setActionLoading(true);
        try {
            const res = await eventService.getById(id);
            // 🎯 อย่าลืมว่า API getById ก็ถูก Interceptor ครอบเหมือนกัน
            setCurrentEvent((res as any)?.data || res);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load event');
        } finally {
            setActionLoading(false);
        }
    }, []);

    // 3. สร้างกิจกรรม
    const createEvent = async (data: any) => {
        setActionLoading(true);
        try {
            await eventService.create(data);
            mutateEvents();
            toast.success('Event created');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    // 4. อัปเดตกิจกรรม
    const updateEvent = async (id: string, data: any) => {
        setActionLoading(true);
        try {
            await eventService.update(id, data);
            mutateEvents();
            toast.success('Event updated');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    // 5. ลบกิจกรรม
    const deleteEvent = async (id: string) => {
        if (!window.confirm('Delete this event?')) return false;

        setActionLoading(true);
        try {
            await eventService.delete(id);
            mutateEvents();
            toast.success('Event deleted');
            return true;
        } catch (error: any) {
            toast.error('Failed to delete');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        events, // ตอนนี้เป็น Array แน่นอน ไม่พังตอน .filter แล้วครับ
        currentEvent,
        loading: isLoading || actionLoading,
        fetchEvents: mutateEvents,
        fetchEvent,
        createEvent,
        updateEvent,
        deleteEvent
    };
};