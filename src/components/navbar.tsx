"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types";
import {
  Ticket,
  User,
  LogOut,
  X,
  CreditCard,
  Calendar,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // 🎯 1. กรองเฉพาะตั๋วที่ยังไม่จัดงานและยืนยันแล้ว
  const activeBookings = useMemo(() => {
    const now = new Date().getTime();
    return allBookings.filter((b) => {
      const eventTime = new Date((b.eventId as any)?.date).getTime();
      return b.status === "confirmed" && eventTime > now;
    });
  }, [allBookings]);

  // 🎯 2. ดึงข้อมูลเมื่อเปิดแผง
  useEffect(() => {
    if (isAuthenticated && isOpen && !isFetching && allBookings.length === 0) {
      setIsFetching(true);
      bookingService
        .getMyBookings(1, 10)
        .then((res: any) => {
          const data = Array.isArray(res) ? res : res.data;
          setAllBookings(data || []);
        })
        .finally(() => setIsFetching(false));
    }
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🎯 3. GSAP Optimized Animation
  useEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      gsap.to(panelRef.current, {
        display: "block",
        height: "auto",
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        force3D: true,
      });
    } else {
      gsap.to(panelRef.current, {
        height: 0,
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => gsap.set(panelRef.current, { display: "none" }),
      });
    }
  }, [isOpen]);

  const isAdmin = user?.role === "admin";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="mx-auto max-w-5xl bg-white/95 backdrop-blur-md rounded-[2rem] border border-zinc-200/50 shadow-2xl relative overflow-hidden will-change-transform">
        <div className="flex items-center justify-between px-8 h-16">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter text-zinc-900 flex items-center gap-2 italic"
          >
            <Ticket className="w-6 h-6 text-indigo-600 fill-indigo-50" />
            Ticket<span className="text-indigo-600">APP</span>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2">
            {isAuthenticated && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 transition-all px-4 py-2"
              >
                Upcoming Events{" "}
                <Ticket
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              </button>
            )}
          </div>

          <AuthNav
            user={user}
            isAuthenticated={isAuthenticated}
            logout={logout}
          />
        </div>

        {isAuthenticated && (
          <div
            ref={panelRef}
            className="hidden opacity-0 h-0 overflow-hidden bg-zinc-50/50 border-t border-zinc-100"
          >
            <div className="p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic text-center w-full">
                  Quick Access
                </h3>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => (
                    <Link
                      key={booking._id}
                      href="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm hover:border-indigo-500 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Calendar size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-zinc-900 leading-none truncate w-40 md:w-64 italic">
                            {(booking.eventId as any).title}
                          </p>
                          <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">
                            Zone {booking.zoneName} • {booking.quantity} Seats
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-300 italic text-[10px] uppercase font-bold tracking-widest bg-white rounded-3xl border border-dashed border-zinc-200">
                    No active tickets
                  </div>
                )}
              </div>

              {/* 🛠️ ปรับสัดส่วน Grid ตาม Role */}
              <div
                className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-3 mt-6`}
              >
                <QuickLink
                  href="/profile"
                  icon={<User size={16} />}
                  label="Profile"
                  onClick={() => setIsOpen(false)}
                />
                <QuickLink
                  href="/my-bookings"
                  icon={<CreditCard size={16} />}
                  label="History"
                  onClick={() => setIsOpen(false)}
                />
                {isAdmin && (
                  <QuickLink
                    href="/admin"
                    icon={
                      <LayoutDashboard size={16} className="text-amber-500" />
                    }
                    label="Admin"
                    onClick={() => setIsOpen(false)}
                  />
                )}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-all flex items-center gap-2"
                >
                  Minimize <X size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function QuickLink({ href, icon, label, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-zinc-100 hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className="text-zinc-400 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">
        {label}
      </span>
    </Link>
  );
}

function AuthNav({ user, isAuthenticated, logout }: any) {
  if (!isAuthenticated)
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          Login
        </Link>
        <Link href="/register">
          <Button className="rounded-full px-6 h-10 text-[10px] font-black uppercase bg-zinc-900 text-white">
            Join
          </Button>
        </Link>
      </div>
    );
  return (
    <div className="flex items-center gap-4 pl-4 border-l border-zinc-100">
      <div className="text-right hidden sm:block leading-tight">
        <p className="text-[10px] font-black uppercase text-zinc-900">
          {user?.firstName || "Guest"}
        </p>
        <button
          onClick={logout}
          className="text-[8px] font-bold uppercase text-rose-500 hover:underline"
        >
          Sign Out
        </button>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
        {user?.firstName?.[0] || "U"}
      </div>
    </div>
  );
}
