"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types";
import { Button } from "@/components/ui";
import {
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Music2,
  History,
  Ban,
} from "lucide-react";
import { TicketCard } from "@/components/TicketCard";
import { motion, AnimatePresence } from "framer-motion";

type FilterType = "all" | "confirmed" | "cancelled";

const ITEMS_PER_PAGE = 6;

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  // Fetch all bookings once — paginate client-side
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const data = await bookingService.getMyBookings(1, 200);
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Reset to page 1 when filter changes
  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(1);
  };

  // Client-side filter + pagination
  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));

  const pagedBookings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, page]);

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-indigo-600 transition-colors mb-4 group"
        >
          <ChevronLeft
            size={14}
            className="mr-1 group-hover:-translate-x-1 transition-transform"
          />
          BACK TO EXPLORE
        </Link>

        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-zinc-900 tracking-tighter italic uppercase"
            >
              My Collection
            </motion.h1>
            <p className="text-zinc-500 font-medium mt-2 uppercase tracking-widest text-xs">
              Your personal vault of events and experiences
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
            <FilterButton
              active={filter === "all"}
              label="All"
              count={bookings.length}
              icon={<Ticket size={14} />}
              onClick={() => handleFilterChange("all")}
            />
            <FilterButton
              active={filter === "confirmed"}
              label="Active"
              count={bookings.filter((b) => b.status === "confirmed").length}
              icon={<Music2 size={14} />}
              onClick={() => handleFilterChange("confirmed")}
            />
            <FilterButton
              active={filter === "cancelled"}
              label="Void"
              count={bookings.filter((b) => b.status === "cancelled").length}
              icon={<Ban size={14} />}
              onClick={() => handleFilterChange("cancelled")}
            />
          </div>
        </header>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 w-full bg-zinc-200 animate-pulse rounded-[2.5rem]"
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-zinc-200"
          >
            <div className="bg-zinc-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tighter">
              Nothing here yet
            </h3>
            <p className="text-zinc-500 mb-8 max-w-xs mx-auto text-sm font-medium">
              Your collection is empty. Grab some tickets and start making
              memories!
            </p>
            <Link href="/">
              <Button className="rounded-full bg-indigo-600 hover:bg-black px-8 h-14 font-black transition-all">
                EXPLORE EVENTS
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {/* Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {pagedBookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TicketCard booking={booking} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination — always show when more than 1 page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-zinc-100 shadow-sm rounded-[2rem] px-6 py-4">
                {/* Prev */}
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl font-bold text-xs gap-2 disabled:opacity-30"
                >
                  <ChevronLeft size={16} /> PREV
                </Button>

                {/* Page number pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${p === page
                            ? "bg-zinc-900 text-white shadow-md"
                            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                {/* Next */}
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl font-bold text-xs gap-2 disabled:opacity-30"
                >
                  NEXT <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Result summary */}
            <p className="text-center text-[10px] font-black tracking-[0.2em] text-zinc-300 uppercase">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, filteredBookings.length)} of{" "}
              {filteredBookings.length} tickets
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component
function FilterButton({
  active,
  label,
  count,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active
          ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
          : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
        }`}
    >
      {icon} {label}
      <span
        className={`text-[9px] rounded-full px-1.5 py-0.5 font-black ${active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"
          }`}
      >
        {count}
      </span>
    </button>
  );
}
