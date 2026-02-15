"use client";

import React, { useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/HeroSection";
import { EventCard } from "@/components/EventCard";

export default function HomePage() {
  const { events, loading: isLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Filter expired events
  const now = new Date();
  const activeEvents = events.filter((event) => new Date(event.date) >= now);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <Navbar />

      <HeroSection />

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="upcoming-events">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Upcoming Events
          </h2>
          <span className="text-zinc-400 text-sm">{activeEvents.length} events available</span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500 text-lg">No upcoming events found.</p>
            <p className="text-zinc-600 text-sm mt-2">Check back later for new announcements.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 py-12 mt-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-zinc-500">
          <p>&copy; 2024 TicketMaster Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
