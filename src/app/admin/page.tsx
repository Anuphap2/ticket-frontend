"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { useBookings } from "@/hooks/useBookings";
import { Button, Card, CardContent } from "@/components/ui";
import { StatsCard } from "@/components/StatsCard";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  // ดึงข้อมูลผ่าน Hook (ที่เราแก้เรื่องการแกะกล่อง .data ไปแล้ว)
  const { events = [], loading: eventsLoading, deleteEvent } = useEvents();
  const { bookings = [], loading: bookingsLoading } = useBookings(true);

  const loading = eventsLoading || bookingsLoading;

  const handleDelete = async (id: string) => {
    if (window.confirm("ยืนยันการลบกิจกรรมนี้?")) {
      await deleteEvent(id);
    }
  };

  // 🎯 ใช้ useMemo คำนวณเพื่อป้องกันหน้าจอค้าง (Infinite Loop)
  // ใช้ useMemo หุ้มการคำนวณทั้งหมด
  const stats = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const getSoldSeats = (eventId: string, zoneName: string) => {
      return safeBookings
        .filter((b) => {
          if (!b || !b.eventId) return false;
          const bId = typeof b.eventId === "object" ? b.eventId._id : b.eventId;
          return (
            bId === eventId &&
            b.zoneName === zoneName &&
            b.status === "confirmed"
          );
        })
        .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
    };

    let totalCapacity = 0;
    let ticketsSold = 0;
    let estimatedRevenue = 0;

    safeEvents.forEach((event) => {
      event.zones?.forEach((zone) => {
        totalCapacity += Number(zone.totalSeats) || 0;
        const sold = getSoldSeats(event._id, zone.name);
        ticketsSold += sold;
        estimatedRevenue += sold * (Number(zone.price) || 0);
      });
    });

    return {
      totalEvents: safeEvents.length,
      totalCapacity,
      ticketsSold,
      estimatedRevenue,
    };
  }, [events, bookings]);

  // ถ้ากำลังโหลดข้อมูล
  if (loading && events.length === 0) {
    return <div className="p-8 text-zinc-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-zinc-500 mt-1">ภาพรวมของกิจกรรมและยอดขายตั๋ว</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/events/create">
            <Button className="shadow-lg hover:shadow-indigo-500/20 transition-all">
              <Plus className="mr-2 h-5 w-5" /> สร้างกิจกรรมใหม่
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline" className="shadow-sm">
              <Ticket className="mr-2 h-5 w-5" /> จัดการรายการจอง
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          description="กิจกรรมทั้งหมด"
        />
        <StatsCard
          title="Total Capacity"
          value={stats.totalCapacity.toLocaleString()}
          icon={Users}
          description="ที่นั่งทั้งหมด"
        />
        <StatsCard
          title="Revenue"
          value={`฿${stats.estimatedRevenue.toLocaleString()}`}
          icon={TrendingUp}
          description="รายได้ (Confirm แล้ว)"
        />
        <StatsCard
          title="Tickets Sold"
          value={stats.ticketsSold.toLocaleString()}
          icon={Ticket}
          description={`${stats.totalCapacity > 0 ? ((stats.ticketsSold / stats.totalCapacity) * 100).toFixed(1) : 0}% ของทั้งหมด`}
        />
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-zinc-800">รายการกิจกรรม</h3>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {events.map((event) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="flex flex-col h-full overflow-hidden border-zinc-200 group">
                  <div className="h-2 bg-indigo-500 w-full" />
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 mb-4">
                      {event.title}
                    </h3>
                    <div className="space-y-3 text-sm text-zinc-600 mb-6">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                        <span>
                          {event.date
                            ? format(new Date(event.date), "PPP p")
                            : "TBA"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-zinc-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        {event.zones?.map((zone) => (
                          <div
                            key={zone.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <span>{zone.name}</span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-indigo-600">
                                {zone.availableSeats}
                              </span>
                              <span className="text-zinc-400 mx-1">/</span>
                              <span className="font-mono text-zinc-900">
                                {zone.totalSeats}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto pt-4 flex gap-3 border-t">
                      <Link
                        href={`/admin/events/${event._id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          แก้ไข
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
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
        </div>
      </div>
    </div>
  );
}
