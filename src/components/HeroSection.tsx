"use client";

import Link from "next/link";
import { Ticket, UserCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

export function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-zinc-950 min-h-[85vh] flex items-center">
      {/* 🎬 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/video/Background_video.mp4" type="video/mp4" />
      </video>

      {/* 🌫 Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-black/30" />

      {/* 🧠 Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
          {/* 🏷 Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            {isAuthenticated ? (
              <>
                Welcome Back, <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.name || "Friend"}
                </span>
              </>
            ) : (
              <>
                Book Your <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Best Moment
                </span>
              </>
            )}
          </h1>

          {/* 📝 Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
            {isAuthenticated
              ? "Ready for your next experience? Check your bookings or discover exciting new events happening now."
              : "Secure your seats for concerts, theatre shows, and unforgettable live experiences happening near you."}
          </p>

          {/* 🚀 CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={() => {
                const el = document.getElementById("upcoming-events");
                if (!el) return;

                const y =
                  el.getBoundingClientRect().top + window.pageYOffset - 80;

                gsap.to(window, {
                  scrollTo: y,
                  duration: 1,
                  ease: "power3.out",
                });
              }}
              className="w-full sm:w-auto rounded-full px-10 h-14 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all"
            >
              <Ticket className="w-5 h-5 mr-2" />
              Browse Events
            </Button>

            {isAuthenticated ? (
              <Link href="/my-bookings" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-10 h-14 text-base font-semibold bg-white/5 text-white border-white/20 hover:bg-white/10 transition-all group"
                >
                  <UserCircle className="w-5 h-5 mr-2 text-indigo-400" />
                  My Bookings
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-10 h-14 text-base font-semibold bg-white/5 text-white border-white/20 hover:bg-white/10 transition-all"
                >
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
