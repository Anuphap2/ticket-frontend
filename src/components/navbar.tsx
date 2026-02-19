"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types";
import {
  Ticket,
  User,
  CreditCard,
  Calendar,
  ArrowRight,
  LayoutDashboard,
  X,
} from "lucide-react";

interface PopulatedEvent {
  _id: string;
  title: string;
  date: string;
}

interface QuickLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = user?.role === "admin";

  // ── Active bookings filtering ────────────────────────────────────────
  const activeBookings = useMemo(() => {
    const now = new Date().getTime();
    return allBookings.filter((b) => {
      const eventData = b.eventId as unknown as PopulatedEvent;
      const eventTime = new Date(eventData?.date).getTime();
      return b.status === "confirmed" && eventTime > now;
    });
  }, [allBookings]);

  // ── Toggle + lazy fetch ──────────────────────────────────────────────
  const togglePanel = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (
      nextOpen &&
      isAuthenticated &&
      allBookings.length === 0 &&
      !isFetching
    ) {
      setIsFetching(true);
      try {
        const res = await bookingService.getMyBookings(1, 10);

        // กำหนด Type โครงสร้างที่คาดหวังจาก API เพื่อแก้ปัญหา any และ never
        const apiResponse = res as
          | Booking[]
          | { data?: Booking[]; bookings?: Booking[] };
        let bookings: Booking[] = [];

        // ตรวจสอบเงื่อนไขตามโครงสร้างที่กำหนดไว้
        if (Array.isArray(apiResponse)) {
          bookings = apiResponse;
        } else if (apiResponse && typeof apiResponse === "object") {
          if (Array.isArray(apiResponse.data)) {
            bookings = apiResponse.data;
          } else if (Array.isArray(apiResponse.bookings)) {
            bookings = apiResponse.bookings;
          }
        }

        setAllBookings(bookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setIsFetching(false);
      }
    }
  };

  // ── GSAP Animation (inspired by the second version – cleaner timeline) ──
  useEffect(() => {
    if (!panelRef.current || !buttonRef.current) return;

    const tl = gsap.timeline({ paused: true });

    if (isOpen) {
      tl.to(buttonRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.25,
        ease: "power2.in",
        pointerEvents: "none",
      }).to(
        panelRef.current,
        {
          height: "auto",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        },
        "-=0.15",
      );
    } else {
      tl.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.42,
        ease: "power3.inOut",
      }).to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: "power2.out",
          pointerEvents: "auto",
        },
        "-=0.2",
      );
    }

    tl.play();

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300`}
    >
      <div
        className={`
          mx-auto max-w-5xl
          bg-white/85 backdrop-blur-md
          rounded-b-0 border border-zinc-200/60 shadow-md
          overflow-hidden relative
          lg:rounded-b-3xl
        `}
      >
        {/* Top bar – grid layout like the second version */}
        <div className="grid grid-cols-3 items-center px-6 sm:px-8 h-16">
          {/* Left – logo */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2"
            >
              <Ticket className="w-6 h-6 text-indigo-600" />
              <div className="hidden md:flex">Ticket<span className="text-indigo-600">APP</span></div>
            </Link>
          </div>

          {/* Center – toggle button */}
          <div className="flex justify-center">
            {isAuthenticated && (
              <button
                ref={buttonRef}
                onClick={togglePanel}
                className={`
                  flex items-center gap-2.5 
                  text-base font-semibold text-zinc-800
                  hover:text-indigo-700 transition-colors
                  border-b-2 border-dotted border-transparent
                  hover:border-zinc-400 pb-0.5
                `}
              >
                Upcoming Tickets
                <svg
                  className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Right – auth area */}
          <div className="flex justify-end items-center gap-5">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-700 hover:text-black"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition"
                >
                  Join
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-amber-600 hover:text-amber-500"
                  >
                    Admin
                  </Link>
                )}
                <span className="text-sm text-zinc-500 hidden sm:block">
                  {user?.firstName || user?.email?.split("@")[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Panel ──────────────────────────────────────────────────────── */}
        {isAuthenticated && (
          <div
            ref={panelRef}
            className="h-0 opacity-0 overflow-hidden bg-zinc-50/70 border-t border-zinc-200/80"
          >
            <div className="py-10 px-6 sm:px-10 max-w-3xl mx-auto relative min-h-80 flex flex-col">
              <div className="flex-1 space-y-6">
                {/* Active bookings list */}
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <Link
                        key={booking._id}
                        href="/my-bookings"
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center justify-between 
                          bg-white/80 p-5 rounded-2xl border border-zinc-200
                          hover:border-indigo-400 hover:shadow-md transition-all group
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 truncate max-w-65 md:max-w-md">
                              {
                                (booking.eventId as unknown as PopulatedEvent)
                                  ?.title
                              }
                            </p>
                            <p className="text-sm text-zinc-500 mt-0.5">
                              Zone {booking.zoneName} • {booking.quantity}{" "}
                              ticket(s)
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 italic">
                    {isFetching ? "Loading tickets..." : "No upcoming events"}
                  </div>
                )}

                {/* Quick links */}
                <div
                  className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-4 mt-8`}
                >
                  <QuickLink
                    href="/profile"
                    icon={<User size={18} />}
                    label="Profile"
                    onClick={() => setIsOpen(false)}
                  />
                  <QuickLink
                    href="/my-bookings"
                    icon={<CreditCard size={18} />}
                    label="My Bookings"
                    onClick={() => setIsOpen(false)}
                  />
                  {isAdmin && (
                    <QuickLink
                      href="/admin"
                      icon={<LayoutDashboard size={18} />}
                      label="Admin Panel"
                      onClick={() => setIsOpen(false)}
                    />
                  )}
                </div>
              </div>

              {/* Close button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-zinc-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                >
                  Close panel <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function QuickLink({ href, icon, label, onClick }: QuickLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-3 p-5 rounded-2xl 
        bg-white border border-zinc-200 hover:border-indigo-300 
        hover:shadow-sm transition-all group
      `}
    >
      <div className="text-zinc-500 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700">
        {label}
      </span>
    </Link>
  );
}
