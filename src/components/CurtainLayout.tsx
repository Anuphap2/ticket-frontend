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

      // 🔥 ป้องกันสร้างซ้ำเวลาเปลี่ยนหน้า
      const existing = ScrollSmoother.get();
      if (existing) existing.kill();

      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.2,
        effects: true,
      });

      ScrollTrigger.refresh();

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
        smoother.kill(); // 🔥 สำคัญมาก
      };
    },
    { scope: wrapperRef },
  );

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-0 w-screen h-screen bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl w-full">
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
              Have a question about an event or booking? Our team is here to
              help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Email
              </p>
              <p className="text-white font-semibold text-sm">
                support@ticketapp.com
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Phone
              </p>
              <p className="text-white font-semibold text-sm">+66 2 000 0000</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Hours
              </p>
              <p className="text-white font-semibold text-sm">
                Mon–Fri, 9:00–18:00
              </p>
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs mt-6">
            © {new Date().getFullYear()} TicketApp. All rights reserved.
          </p>
        </div>
      </div>

      {/* SMOOTH WRAPPER */}
      <div
        ref={wrapperRef}
        id="smooth-wrapper"
        className="relative z-10 w-full"
      >
        <div ref={contentRef} id="smooth-content">
          <div className="min-h-screen w-full bg-zinc-950 text-white shadow-[0_40px_80px_rgba(0,0,0,0.9)] relative z-20 flex flex-col overflow-hidden will-change-transform">
            {children}
          </div>

          <div className="h-screen w-full pointer-events-none bg-transparent" />
        </div>
      </div>
    </>
  );
}
