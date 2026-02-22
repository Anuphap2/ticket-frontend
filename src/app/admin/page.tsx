"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useEvents } from "@/hooks/useEvents";
import { useBookings } from "@/hooks/useBookings";
import { Button, Card } from "@/components/ui";
import { StatsCard } from "@/components/StatsCard";
import toast from "react-hot-toast";
import {
  Calendar,
  Edit,
  Trash2,
  Plus,
  Ticket,
  TrendingUp,
  Users,
  Power,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminDashboard() {
  const {
    events = [],
    loading: eventsLoading,
    deleteEvent,
    updateEvent,
  } = useEvents(true);
  const { bookings = [], loading: bookingsLoading } = useBookings(true);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 🎯 State สำหรับกางดูโซน
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loading = eventsLoading || bookingsLoading;

  const stats = useMemo(() => {
    const safeEvents = Array.isArray(events) ? events : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    const targetEvents = selectedEventId
      ? safeEvents.filter((e) => e._id === selectedEventId)
      : safeEvents;

    let totalCapacity = 0;
    let ticketsSold = 0;
    let estimatedRevenue = 0;

    targetEvents.forEach((event) => {
      event.zones?.forEach((zone) => {
        totalCapacity += Number(zone.totalSeats) || 0;
      });
    });

    safeBookings.forEach((b) => {
      if (b.status?.toLowerCase() === "confirmed") {
        const bEventId = (
          typeof b.eventId === "object" ? b.eventId?._id : b.eventId
        )?.toString();
        if (!selectedEventId || bEventId === selectedEventId) {
          const qty = Number(b.quantity) || 0;
          let price = Number(b.price) || 0;
          if (price === 0) {
            const targetEvent = safeEvents.find(
              (e) => e._id.toString() === bEventId,
            );
            const targetZone = targetEvent?.zones?.find(
              (z) => z.name === b.zoneName,
            );
            price = Number(targetZone?.price) || 0;
          }
          ticketsSold += qty;
          estimatedRevenue += qty * price;
        }
      }
    });

    return {
      totalEvents: targetEvents.length,
      totalCapacity,
      ticketsSold,
      estimatedRevenue,
    };
  }, [events, bookings, selectedEventId]);

  const filteredEvents = useMemo(() => {
    if (currentFilter === "all") return events;
    return events.filter((e) => e.status === currentFilter);
  }, [events, currentFilter]);

  const handleToggleStatus = async (event: any) => {
    setTogglingId(event._id);
    const newStatus = event.status === "active" ? "inactive" : "active";
    try {
      await updateEvent(event._id, { status: newStatus });
      toast.success(`Set to ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error("Status update failed");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-zinc-50/50 min-h-screen antialiased">
      {/* Header & Stats Cards เหมือนเดิม */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter italic uppercase">
              Dashboard
            </h2>
            {selectedEventId && (
              <Badge className="bg-indigo-600 text-white rounded-full px-4 animate-in slide-in-from-left-2">
                Focus Mode
              </Badge>
            )}
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
            {selectedEventId
              ? "Analyzing Selected Concert"
              : "Global Network Performance"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings">
            <Button
              variant="outline"
              className="rounded-2xl bg-white font-black text-[10px] px-6 h-12 uppercase"
            >
              <Ticket size={14} className="mr-2" /> Bookings
            </Button>
          </Link>

          <Link href="/admin/events/create">
            <Button className="rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-[10px] px-6 h-12 uppercase">
              <Plus size={14} className="mr-2" /> New Event
            </Button>
          </Link>

          <Link href="/admin/users">
            <Button className="rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-[10px] px-6 h-12 uppercase">
              <Users size={14} className="mr-2" /> Users
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative">
        <StatsCard
          title={selectedEventId ? "Focused Event" : "Total Events"}
          value={stats.totalEvents}
          icon={Calendar}
          description="Campaign scope"
        />
        <StatsCard
          title="Revenue"
          value={`฿${stats.estimatedRevenue.toLocaleString()}`}
          icon={TrendingUp}
          description="Net earnings"
        />
        <StatsCard
          title="Tickets Sold"
          value={stats.ticketsSold}
          icon={Ticket}
          description="Active passes"
        />
        <StatsCard
          title="Fill Rate"
          value={`${stats.totalCapacity > 0 ? ((stats.ticketsSold / stats.totalCapacity) * 100).toFixed(1) : 0}%`}
          icon={Users}
          description="Occupancy"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 w-fit shadow-sm">
            <FilterTab
              active={currentFilter === "all"}
              label="All"
              count={events.length}
              onClick={() => setCurrentFilter("all")}
            />
            <FilterTab
              active={currentFilter === "active"}
              label="Active"
              count={events.filter((e) => e.status === "active").length}
              onClick={() => setCurrentFilter("active")}
            />
            <FilterTab
              active={currentFilter === "inactive"}
              label="Inactive"
              count={events.filter((e) => e.status === "inactive").length}
              onClick={() => setCurrentFilter("inactive")}
            />
          </div>
          {selectedEventId && (
            <button
              onClick={() => setSelectedEventId(null)}
              className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 px-4 py-2 rounded-xl transition-all"
            >
              <XCircle size={16} /> Reset Stats View
            </button>
          )}
        </div>

        <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.04)] overflow-hidden rounded-[2.5rem] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/30">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 w-10"></th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Event Detail
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Total Sales
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredEvents.map((event) => {
                  const totalSeats =
                    event.zones?.reduce((acc, z) => acc + z.totalSeats, 0) || 0;
                  const availSeats =
                    event.zones?.reduce(
                      (acc, z) => acc + z.availableSeats,
                      0,
                    ) || 0;
                  const soldCount = totalSeats - availSeats;
                  const soldPercent =
                    totalSeats > 0
                      ? Math.round((soldCount / totalSeats) * 100)
                      : 0;
                  const isActive = event.status === "active";
                  const isSelected = selectedEventId === event._id;
                  const isExpanded = expandedId === event._id;

                  return (
                    <React.Fragment key={event._id}>
                      <tr
                        onClick={() => setSelectedEventId(event._id)}
                        className={`group cursor-pointer transition-all ${isSelected ? "bg-indigo-50/50" : !isActive ? "bg-zinc-50/50 opacity-70" : "hover:bg-zinc-50/30"}`}
                      >
                        <td
                          className="px-8 py-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : event._id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-indigo-600" />
                          ) : (
                            <ChevronDown size={16} className="text-zinc-400" />
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div
                            className={`font-black text-lg tracking-tight uppercase italic leading-none ${isSelected ? "text-indigo-600" : isActive ? "text-zinc-900" : "text-zinc-400"}`}
                          >
                            {event.title}
                          </div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                            {event.location} •{" "}
                            {event.date
                              ? format(new Date(event.date), "dd MMM HH:mm")
                              : "-"}
                          </div>
                        </td>
                        <td
                          className="px-8 py-6 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleToggleStatus(event)}
                            disabled={togglingId === event._id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-zinc-200 text-zinc-500"}`}
                          >
                            {togglingId === event._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Power size={12} />
                            )}
                            {isActive ? "Selling" : "Paused"}
                          </button>
                        </td>
                        <td className="px-8 py-6 w-72">
                          <div className="flex justify-between text-[10px] mb-2 font-black uppercase">
                            <span
                              className={
                                isActive ? "text-indigo-600" : "text-zinc-400"
                              }
                            >
                              {soldPercent}% Booked
                            </span>
                            <span className="text-zinc-400">
                              {soldCount}/{totalSeats}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${isActive ? "bg-indigo-600" : "bg-zinc-300"}`}
                              style={{ width: `${soldPercent}%` }}
                            />
                          </div>
                        </td>
                        <td
                          className="px-8 py-6 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/events/${event._id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl bg-zinc-50 hover:bg-white border border-zinc-100"
                              >
                                <Edit size={16} className="text-zinc-600" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-100"
                              onClick={() => deleteEvent(event._id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* 🎯 Zone Breakdown Section (Grows when expanded) */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-zinc-50/80 px-16 py-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {event.zones?.map((zone) => {
                                // คำนวณรายได้แต่ละโซนจาก bookings
                                const zoneSold = Array.isArray(bookings)
                                  ? bookings
                                      .filter(
                                        (b) =>
                                          (typeof b.eventId === "object"
                                            ? b.eventId?._id
                                            : b.eventId) === event._id &&
                                          b.zoneName === zone.name &&
                                          b.status?.toLowerCase() ===
                                            "confirmed",
                                      )
                                      .reduce(
                                        (sum, b) =>
                                          sum + (Number(b.quantity) || 0),
                                        0,
                                      )
                                  : 0;

                                const zoneRevenue =
                                  zoneSold * (Number(zone.price) || 0);

                                return (
                                  <div
                                    key={zone.name}
                                    className="bg-white p-6 rounded-[2rem] border border-zinc-200/50 shadow-sm flex flex-col gap-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                          Zone
                                        </span>
                                        <h4 className="text-xl font-black italic uppercase text-zinc-800">
                                          {zone.name}
                                        </h4>
                                      </div>
                                      <Badge className="bg-zinc-100 text-zinc-500 border-none font-black text-[9px]">
                                        ฿{zone.price.toLocaleString()}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-50">
                                      <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                          Tickets Sold
                                        </p>
                                        <p className="text-lg font-black text-zinc-900">
                                          {zoneSold}{" "}
                                          <span className="text-xs text-zinc-400">
                                            / {zone.totalSeats}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                          Zone Revenue
                                        </p>
                                        <p className="text-lg font-black text-emerald-600">
                                          ฿{zoneRevenue.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    {/* Small Progress Bar */}
                                    <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="h-full bg-indigo-500"
                                        style={{
                                          width: `${(zoneSold / zone.totalSeats) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FilterTab({ active, label, count, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${active ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"}`}
    >
      {label}{" "}
      <span
        className={`px-1.5 py-0.5 rounded-md text-[8px] ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"}`}
      >
        {count}
      </span>
    </button>
  );
}

function Badge({ children, className }: any) {
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full ${className}`}
    >
      {children}
    </span>
  );
}
