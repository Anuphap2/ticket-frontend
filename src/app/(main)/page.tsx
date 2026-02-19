"use client";

import React, { useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useEvents } from "@/hooks/useEvents";
import { HeroSection } from "@/components/HeroSection";
import { EventCard } from "@/components/EventCard";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const { events, loading: isLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const activeEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      const isUpcoming = new Date(event.date) >= now;
      const isSelling = event.status === "active"; // 🎯 ต้องเช็ค status ด้วย
      return isUpcoming && isSelling;
    });
  }, [events]);

  // 🎇 GSAP Stagger Animation
  useGSAP(
    () => {
      if (isLoading || activeEvents.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#upcoming-events",
          start: "top 85%",
        },
      });

      tl.from(".event-section-title", {
        opacity: 0,
        x: -50,
        duration: 0.8,
        ease: "power4.out",
      }).from(
        ".event-card-item",
        {
          opacity: 0,
          y: 60,
          stagger: 0.15, // 🎯 ค่อยๆ เด้งขึ้นมาทีละใบ
          duration: 1,
          ease: "expo.out",
        },
        "-=0.4",
      );
    },
    { dependencies: [isLoading, activeEvents.length] },
  );

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <main
        className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 pb-44"
        id="upcoming-events"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 event-section-title">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-zinc-900 uppercase italic">
              Upcoming <span className="text-indigo-600">Events</span>
            </h2>
            <p className="text-zinc-500 font-medium mt-2 uppercase tracking-[0.2em] text-xs">
              Handpicked experiences just for you
            </p>
          </div>
          <Badge count={activeEvents.length} />
        </div>

        {/* Content Area */}
        {isLoading ? (
          // 🦴 Skeleton Loading State
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] rounded-[32px] bg-zinc-100 animate-pulse border border-zinc-200"
              />
            ))}
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-32 bg-zinc-50 rounded-[40px] border-2 border-zinc-100 border-dashed">
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm italic">
              Stay tuned! New moments are coming soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <div key={event._id} className="event-card-item">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-component เล็กๆ เพื่อความสะอาด
function Badge({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-900 text-white gap-2 shadow-lg">
      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest">
        {count} LIVE NOW
      </span>
    </div>
  );
}
