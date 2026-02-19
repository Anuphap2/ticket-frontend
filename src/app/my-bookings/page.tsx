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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 6; // ลดเหลือ 6 เพื่อความสวยงามในหน้าเดียว

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const response: any = await bookingService.getMyBookings(page, LIMIT);
        if (Array.isArray(response)) {
          setBookings(response);
          setTotalPages(1);
        } else {
          setBookings(response.data);
          setTotalPages(response.last_page || 1);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [page]);

  // กรองข้อมูลฝั่ง Client เพื่อความลื่นไหล
  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

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
        
        {/* Header Section */}
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
              icon={<Ticket size={14} />}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              active={filter === "confirmed"}
              label="Active"
              icon={<Music2 size={14} />}
              onClick={() => setFilter("confirmed")}
            />
            <FilterButton
              active={filter === "cancelled"}
              label="Void"
              icon={<Ban size={14} />}
              onClick={() => setFilter("cancelled")}
            />
          </div>
        </header>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
          <div className="space-y-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TicketCard booking={booking} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-zinc-100 shadow-sm">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="rounded-xl font-bold"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> PREV
                </Button>
                <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="rounded-xl font-bold"
                >
                  NEXT <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component เพื่อความคลีน
function FilterButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
          : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}
