'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { bookingService } from '@/services/bookingService'; // Use service instead of direct axios
import { Booking } from '@/types';
import { Button } from '@/components/ui';
import { Ticket, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TicketCard } from '@/components/TicketCard';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 9; // Show 9 tickets per page (3x3 grid)

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                // Determine if the response is array or paginated object based on service update
                const response: any = await bookingService.getMyBookings(page, LIMIT);

                // Handle both structures for backward compatibility (though we updated service)
                if (Array.isArray(response)) {
                    setBookings(response);
                    setTotalPages(1);
                } else {
                    setBookings(response.data);
                    setTotalPages(response.last_page || 1);
                }
            } catch (error) {
                console.error('Failed to fetch bookings', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [page]);

    const handlePrevious = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex min-h-screen items-center justify-center text-indigo-600">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">My Bookings</h1>
                        <p className="text-zinc-500 mt-1">Manage all your upcoming and past events.</p>
                    </div>

                    <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center bg-white px-4 py-2 rounded-lg border border-zinc-200 shadow-sm transition-all hover:shadow-md">
                        &larr; Browse Events
                    </Link>
                </div>

                {bookings.length === 0 && !isLoading ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">No bookings found</h3>
                        <p className="text-zinc-500 mb-8 max-w-md mx-auto">You haven't booked any events yet. Explore our upcoming concerts and secure your spot today!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300"
                        >
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {bookings.map((booking) => (
                                <TicketCard key={booking._id} booking={booking} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center space-x-6">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={page === 1}
                                    className="w-32"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <span className="text-sm font-medium text-zinc-600 bg-white px-4 py-2 rounded-md border border-zinc-200 shadow-sm">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={handleNext}
                                    disabled={page === totalPages}
                                    className="w-32"
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
