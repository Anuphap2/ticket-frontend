'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { Booking } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Calendar, MapPin, Ticket, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('/bookings/myBookings');
                setBookings(response.data);
            } catch (error) {
                console.error('Failed to fetch bookings', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-zinc-600 bg-zinc-50 border-zinc-200';
        }
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5" />;
            case 'pending':
                return <Clock className="h-5 w-5" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-zinc-900">My Bookings</h1>
                    <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        &larr; Back to Events
                    </Link>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
                        <Ticket className="mx-auto h-12 w-12 text-zinc-400" />
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900">No bookings yet</h3>
                        <p className="mt-1 text-sm text-zinc-500">Get started by booking your first event.</p>
                        <div className="mt-6">
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            // Handle populated event or just ID (though usually it should be populated)
                            const eventTitle = typeof booking.eventId === 'object' ? booking.eventId.title : 'Event Details Unavailable';
                            const eventDate = typeof booking.eventId === 'object' ? booking.eventId.date : null;
                            const eventLocation = typeof booking.eventId === 'object' ? booking.eventId.location : null;

                            return (
                                <Card key={booking._id} className="overflow-hidden">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="flex-1 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-zinc-900">{eventTitle}</h3>
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                                    {getStatusIcon(booking.status)}
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </span>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 text-sm text-zinc-600">
                                                {eventDate && (
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                                                        {format(new Date(eventDate), 'PPP p')}
                                                    </div>
                                                )}
                                                {eventLocation && (
                                                    <div className="flex items-center">
                                                        <MapPin className="mr-2 h-4 w-4 text-zinc-400" />
                                                        {eventLocation}
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Ticket className="mr-2 h-4 w-4 text-zinc-400" />
                                                    Zone: {booking.zoneName} ({booking.quantity} tickets)
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-mono text-xs text-zinc-400">ID: {booking._id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
