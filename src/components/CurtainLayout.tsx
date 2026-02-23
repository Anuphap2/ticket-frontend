"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);
}

export function CurtainLayout({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapperRef.current || !contentRef.current) return;

      ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.2,
        effects: true,
      });

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(contentRef.current);

      return () => resizeObserver.disconnect();
    },
    { scope: wrapperRef },
  );

  return (
    <>
      {/* 1. Contact Us backdrop — revealed when user scrolls to bottom */}
      <div className="fixed inset-0 z-0 w-screen h-screen bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl w-full">
          {/* Heading */}
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-3">
              We&apos;d love to hear from you
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Us
              </span>
            </h2>
            <p className="mt-4 text-zinc-400 text-base max-w-md mx-auto leading-relaxed">
              Have a question about an event or booking? Our team is here to help.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Email */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</p>
              <p className="text-white font-semibold text-sm">support@ticketapp.com</p>
            </div>

            {/* Phone */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phone</p>
              <p className="text-white font-semibold text-sm">+66 2 000 0000</p>
            </div>

            {/* Hours */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hours</p>
              <p className="text-white font-semibold text-sm">Mon–Fri, 9:00–18:00</p>
            </div>
          </div>

          {/* Quick message form */}
          <form
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Your message..."
              className="flex-[2] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors shrink-0"
            >
              Send Message
            </button>
          </form>

          <p className="text-center text-zinc-600 text-xs mt-6">
            © {new Date().getFullYear()} TicketApp. All rights reserved.
          </p>
        </div>
      </div>

      {/* 2. Scroll Wrapper — transparent so backdrop shows through */}
      <div
        ref={wrapperRef}
        id="smooth-wrapper"
        className="relative z-10 w-full"
      >
        <div ref={contentRef} id="smooth-content">
          {/* 3. The Curtain — main content panel */}
          <div className="min-h-screen w-full bg-zinc-950 text-white shadow-[0_40px_80px_rgba(0,0,0,0.9)] relative z-20 flex flex-col overflow-hidden">
            {children}
          </div>

          {/* 4. Spacer — lets scroll reveal the Contact Us backdrop */}
          <div className="h-screen w-full pointer-events-none bg-transparent" />
        </div>
      </div>
    </>
  );
}
