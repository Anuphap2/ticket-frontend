'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  const { events, loading: isLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Filter expired events
  const now = new Date();
  const activeEvents = events.filter(event => new Date(event.date) >= now);

  return (
    <div className="min-h-screen bg-[#1A1A1D]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-zinc-800">Upcoming Events (Real-time Availability)</h2>
        {activeEvents.length === 0 ? (
          <p className="text-center text-zinc-500">No upcoming events found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => {
              // Calculate total availability from zones (Backend should provide accurate data now)
              let totalCapacity = 0;
              let totalAvailable = 0;

              event.zones.forEach((zone: any) => {
                totalCapacity += zone.totalSeats;
                totalAvailable += (zone.availableSeats);
              });

              const isSoldOut = totalAvailable <= 0;

              return (
                <Card key={event._id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                  {event.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="bg-zinc-100 p-4">
                    <CardTitle className="truncate text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <div className="mb-2 flex items-center text-sm text-zinc-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{format(new Date(event.date), 'PPP p')}</span>
                    </div>
                    <div className="mb-4 flex items-center text-sm text-zinc-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="mb-4 flex items-center text-sm font-medium">
                      <Ticket className="mr-2 h-4 w-4 text-indigo-600" />
                      <span className={isSoldOut ? 'text-red-500' : 'text-green-600'}>
                        {isSoldOut ? 'Sold Out' : `Available: ${totalAvailable} / ${totalCapacity}`}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm text-zinc-500">{event.description}</p>
                  </CardContent>
                  <CardFooter className="bg-zinc-50 p-4">
                    {isSoldOut ? (
                      <Button className="w-full" disabled>Sold Out</Button>
                    ) : (
                      <Link href={`/events/${event._id}`} className="w-full">
                        <Button className="w-full">Book Now</Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}