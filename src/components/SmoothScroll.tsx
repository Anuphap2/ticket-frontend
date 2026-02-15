"use client";

import React, { useLayoutEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";

// ลงทะเบียน Plugins นอกเหนือจากการรันฝั่ง Server
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    // สร้าง ScrollSmoother Instance
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5, // ระยะเวลาความหน่วง (วินาที)
      effects: true, // เปิดใช้งานเอฟเฟกต์ parallax หรือความเร็วที่ต่างกัน
      smoothTouch: 0.1, // ทำให้การสัมผัสบนมือถือสมูทขึ้นเล็กน้อย (ถ้าต้องการ)
    });

    // ล้างค่าเมื่อ Component ถูกถอดออกเพื่อป้องกัน Memory Leak
    return () => {
      smoother.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
