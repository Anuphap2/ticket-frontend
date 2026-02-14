import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import toast from 'react-hot-toast';

export const useEvents = () => {
    // Use SWR for fetching events with polling every 3 seconds
    const { data: events = [], error, isLoading, mutate: mutateEvents } = useSWR<Event[]>(
        '/events',
        eventService.getAll,
        {
            refreshInterval: 3000, // Poll every 3 seconds for real-time like updates
            revalidateOnFocus: true
        }
    );

    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = useCallback(async (id: string) => {
        setActionLoading(true);
        try {
            const data = await eventService.getById(id);
            setCurrentEvent(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load event');
        } finally {
            setActionLoading(false);
        }
    }, []);

    const createEvent = async (data: any) => {
        setActionLoading(true);
        try {
            await eventService.create(data);
            mutateEvents(); // Revalidate SWR data
            toast.success('Event created');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

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
        events,
        currentEvent,
        loading: isLoading || actionLoading,
        fetchEvents: mutateEvents, // exposing mutate as fetchEvents for compatibility
        fetchEvent,
        createEvent,
        updateEvent,
        deleteEvent
    };
};
