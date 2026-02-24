"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useEffect, ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // เอาพารามิเตอร์ time ออกเพื่อแก้ปัญหา unused variables
    function update() {
      ScrollTrigger.update();
    }

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {/* ใส่ as any เพื่อแก้ปัญหา Type ขัดแย้งกันระหว่าง React 18 และ 19 */}
      {children as any}
    </ReactLenis>
  );
}
