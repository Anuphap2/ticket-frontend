"use client";

import React, { useRef, useEffect } from "react";
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

      // สำคัญ: สั่งให้คำนวณความสูงใหม่เสมอเมื่อเนื้อหาด้านในมีการเปลี่ยนแปลง (เช่น โหลดข้อมูลเสร็จ)
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
      {/* 1. ส่วนฉากหลัง (Reveal Section)
          อยู่ล่างสุด (z-0) และ Fixed อยู่กับที่
      */}
      <div className="fixed inset-0 z-0 w-screen h-screen bg-gradient-to-br from-indigo-950 to-zinc-900 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-8">
            THE GRAND REVEAL
          </h2>
          <p className="text-xl text-zinc-300 md:text-2xl max-w-2xl mx-auto leading-relaxed">
            This content was hidden behind your main page. You can place your
            final call to action here.
          </p>
          <div className="mt-12 flex gap-4 justify-center">
            <button className="px-8 py-4 rounded-full bg-white text-zinc-900 font-bold text-lg hover:bg-zinc-200 transition-colors">
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* 2. ส่วนควบคุมการเลื่อน (Scroll Wrapper) 
          ต้องเป็นแบบโปร่งใส (ไม่มี bg) เพื่อให้มองทะลุไปยังฉากหลังได้
      */}
      <div
        ref={wrapperRef}
        id="smooth-wrapper"
        className="relative z-10 w-full"
      >
        <div ref={contentRef} id="smooth-content">
          {/* 3. ผ้าม่านเนื้อหาหลัก (The Curtain)
              นำสีพื้นหลัง ขอบมน และเงา มาใส่ที่กล่องที่ห่อหุ้ม children นี้แทน
          */}
          <div className="min-h-screen w-full bg-zinc-950 text-white shadow-[0_40px_80px_rgba(0,0,0,0.9)] relative z-20 flex flex-col overflow-hidden">
            {children}
          </div>

          {/* 4. ตัวเว้นระยะ (The Spacer)
              ดันเนื้อหาให้สุดเพื่อให้ Scroll เลื่อนขึ้นไปเปิดฉากหลัง
          */}
          <div className="h-screen w-full pointer-events-none bg-transparent" />
        </div>
      </div>
    </>
  );
}
