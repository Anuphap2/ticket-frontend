'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { useBookings } from '@/hooks/useBookings';
import { Button, Card, CardContent } from '@/components/ui';
import { StatsCard } from '@/components/StatsCard';
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Ticket,
  TrendingUp,
  Users
} from 'lucide-react';

export default function AdminDashboard() {
  const { events, loading: eventsLoading, deleteEvent } = useEvents();
  const { bookings, loading: bookingsLoading } = useBookings(true);

  const loading = eventsLoading || bookingsLoading;

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
  };

  // Helper to calculate sold seats for a specific zone in an event
  const getSoldSeats = (eventId: string, zoneName: string) => {
    return bookings
      .filter(b =>
        (typeof b.eventId === 'string' ? b.eventId === eventId : b.eventId._id === eventId) &&
        b.zoneName === zoneName &&
        b.status === 'confirmed'
      )
      .reduce((acc, b) => acc + b.quantity, 0);
  };

  // คำนวณสถิติต่างๆ จาก Array 'events' และ 'bookings'
  const totalEvents = events.length;

  // 1. ความจุทั้งหมด (Total Capacity)
  const totalCapacity = events.reduce((acc, event) => {
    return acc + event.zones.reduce((zAcc, z) => zAcc + z.totalSeats, 0);
  }, 0);

  // 2. จำนวนที่จองไปแล้ว (Tickets Sold - Confirmed Only)
  const ticketsSold = events.reduce((acc, event) => {
    return acc + event.zones.reduce((zAcc, z) => {
      const sold = getSoldSeats(event._id, z.name);
      return zAcc + sold;
    }, 0);
  }, 0);

  // 3. รายได้ประมาณการ (Estimated Revenue - from Confirmed Bookings)
  const estimatedRevenue = events.reduce((acc, event) => {
    const eventRevenue = event.zones.reduce((zAcc, z) => {
      const sold = getSoldSeats(event._id, z.name);
      return zAcc + (sold * z.price);
    }, 0);
    return acc + eventRevenue;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 mt-1">Overview of your events and ticket sales.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/events/create">
            <Button className="shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline" className="shadow-sm hover:shadow-indigo-500/20 transition-all">
              <Ticket className="mr-2 h-5 w-5" />
              Manage Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={totalEvents}
          icon={Calendar}
          description="Active concerts & shows"
        />
        <StatsCard
          title="Total Capacity"
          value={totalCapacity.toLocaleString()}
          icon={Users}
          description="Max possible attendees"
        />
        <StatsCard
          title="Revenue"
          value={`฿${estimatedRevenue.toLocaleString()}`}
          icon={TrendingUp}
          description="From confirmed bookings"
        />
        <StatsCard
          title="Tickets Sold"
          value={ticketsSold.toLocaleString()}
          icon={Ticket}
          description={`${totalCapacity > 0 ? ((ticketsSold / totalCapacity) * 100).toFixed(1) : 0}% of total capacity`}
        />
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800">Active Events</h3>

        {loading && events.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="flex flex-col h-full overflow-hidden border-zinc-200 hover:border-indigo-200 transition-colors group">
                    <div className="h-2 bg-indigo-500 w-full" />
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {event.title}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 mt-2">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-zinc-600 mb-6">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                          <span className="truncate">{format(new Date(event.date), 'PPP p')}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-zinc-400" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        <div className="pt-2 border-t border-zinc-100">
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Zones Capacity & Availability</p>
                          <div className="space-y-2">
                            {event.zones.map(zone => {
                              const sold = getSoldSeats(event._id, zone.name);
                              const available = zone.totalSeats - sold;
                              return (
                                <div key={zone.name} className="flex items-center justify-between text-xs">
                                  <span>{zone.name}</span>
                                  <div className="text-right">
                                    <span className={`font-mono font-bold ${available === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                      {available}
                                    </span>
                                    <span className="text-zinc-400 mx-1">/</span>
                                    <span className="font-mono text-zinc-900">{zone.totalSeats}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 flex gap-3 border-t border-zinc-100">
                        <Link href={`/admin/events/${event._id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full hover:bg-zinc-50 hover:text-indigo-600 hover:border-indigo-200">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(event._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {events.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-zinc-200 border-dashed">
                <Calendar className="mx-auto h-12 w-12 text-zinc-300" />
                <h3 className="mt-2 text-sm font-semibold text-zinc-900">No events found</h3>
                <p className="mt-1 text-sm text-zinc-500">Get started by creating a new event.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
