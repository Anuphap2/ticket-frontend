"use client";

import React, { useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useEvents } from "@/hooks/useEvents";
import { HeroSection } from "@/components/HeroSection";
import { EventCard } from "@/components/EventCard";

// ลงทะเบียน Plugin สำหรับ Client Side
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function HomePage() {
  const { events, loading: isLoading, fetchEvents } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const activeEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.date) >= now);
  }, [events]);

  useGSAP(
    () => {
      if (isLoading) return;

      // แอนิเมชันเฉพาะหน้าแรก
      gsap.from("#upcoming-events", {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#upcoming-events",
          start: "top 80%",
        },
      });
    },
    { dependencies: [isLoading] },
  );

  // แสดงหน้า Loading ระหว่างรอข้อมูล
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // ส่งคืนเฉพาะเนื้อหาหลัก (ไม่มี Wrapper หรือ Layout มาครอบแล้ว)
  return (
    <>
      <HeroSection />

      <main
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 pb-32"
        id="upcoming-events"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Upcoming Events
          </h2>
          <span className="text-zinc-400 text-sm">
            {activeEvents.length} events available
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500 text-lg">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
