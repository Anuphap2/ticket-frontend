'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import toast from 'react-hot-toast';

export const useEvents = () => {
    const {
        data: response,
        error,
        isLoading,
        mutate: mutateEvents,
    } = useSWR('/events', eventService.getAll, {
        refreshInterval: 3000,
        revalidateOnFocus: true,
    });

    // Normalise to always be an Event[]
    const events: Event[] =
        (Array.isArray(response) ? response : (response as any)?.data) || [];

    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = useCallback(async (id: string) => {
        setActionLoading(true);
        try {
            const res = await eventService.getById(id);
            setCurrentEvent((res as any)?.data ?? res);
        } catch {
            toast.error('Failed to load event');
        } finally {
            setActionLoading(false);
        }
    }, []);

    const createEvent = async (data: any): Promise<boolean> => {
        setActionLoading(true);
        try {
            await eventService.create(data);
            mutateEvents();
            toast.success('Event created');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create event');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const updateEvent = async (id: string, data: any): Promise<boolean> => {
        setActionLoading(true);
        try {
            await eventService.update(id, data);
            mutateEvents();
            toast.success('Event updated');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update event');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Deletes an event. The calling component is responsible for showing a
     * confirmation dialog — window.confirm does not belong in a hook.
     */
    const deleteEvent = async (id: string): Promise<boolean> => {
        setActionLoading(true);
        try {
            await eventService.delete(id);
            mutateEvents();
            toast.success('Event deleted');
            return true;
        } catch {
            toast.error('Failed to delete event');
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        events,
        currentEvent,
        error,
        loading: isLoading || actionLoading,
        isLoading,
        actionLoading,
        fetchEvents: mutateEvents,
        fetchEvent,
        createEvent,
        updateEvent,
        deleteEvent,
    };
};