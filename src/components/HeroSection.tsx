"use client";

import Link from "next/link";
import { Ticket, UserCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext"; // 👈 ดึง context ที่พู่กันใช้

export function HeroSection() {
  const { isAuthenticated, user } = useAuth(); // 👈 เช็คสถานะตรงนี้

  return (
    <div className="relative overflow-hidden bg-zinc-900 py-44 min-h-[80vh] flex items-center">
      {/* 1. Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      >
        <source src="/video/Background_video.mp4" type="video/mp4" />
      </video>

      {/* 2. Optimized Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
      <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-xs"></div>

      {/* 3. Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 w-full text-center lg:text-left">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl uppercase italic drop-shadow-2xl">
            {isAuthenticated ? `Welcome Back, \n ${user?.name || 'Friend'}` : "Book Your \n Best Moment"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300 max-w-xl font-medium drop-shadow-md">
            {isAuthenticated 
              ? "Ready for your next experience? Check your reserved seats or discover new events happening right now."
              : "Secure your seats for the hottest concerts, theater shows, and events. Experience the thrill of live performance."}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
            <Link href="#upcoming-events">
              <Button size="lg" className="rounded-full px-10 h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                <Ticket className="w-5 h-5 mr-2" />
                Browse Events
              </Button>
            </Link>

            {/* 🎯 สลับปุ่มตามสถานะ Login */}
            {isAuthenticated ? (
              <Link href="/my-bookings">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-10 h-14 text-base font-bold bg-white/5 text-white border-white/20 hover:bg-white/10 transition-colors group"
                >
                  <UserCircle className="w-5 h-5 mr-2 text-indigo-400" />
                  My Bookings
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-10 h-14 text-base font-bold bg-white/5 text-white border-white/20 hover:bg-white/10 transition-colors"
                >
                  Create account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}