"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // สร้าง Ref สำหรับจับ Element ที่ต้องการทำ Animation
  const contentRef = useRef<HTMLDivElement>(null);
  const topButtonRef = useRef<HTMLButtonElement>(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!contentRef.current || !topButtonRef.current) return;

    if (isOpen) {
      // 1. แอนิเมชันตอนเปิด (กางออก)
      // ซ่อนปุ่มด้านบน
      gsap.to(topButtonRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        pointerEvents: "none",
      });

      // กางเนื้อหาออกโดยดึงความสูงอัตโนมัติ (auto)
      gsap.to(contentRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.6,
        ease: "power3.inOut",
      });
    } else {
      // 2. แอนิเมชันตอนปิด (หุบเข้า)
      // หุบเนื้อหากลับไปที่ความสูง 0
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });

      // แสดงปุ่มด้านบนกลับคืนมา
      gsap.to(topButtonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay: 0.2, // รอให้หุบเกือบเสร็จก่อนค่อยโชว์ปุ่ม
        pointerEvents: "auto",
      });
    }
  }, [isOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-center z-50 px-4">
      {/* Container หลัก */}
      <div className="w-full max-w-4xl bg-[#e5e5e5] shadow-xl rounded-b-2xl overflow-hidden relative">
        {/* Navbar แถบด้านบนสุด (แสดงตลอดเวลาแต่ปุ่มจะถูกซ่อนตอนกาง) */}
        <div className="flex h-16 items-center justify-between px-6 relative z-10">
          <div className="w-16"></div> {/* Spacer รักษาสมดุล */}
          <button
            ref={topButtonRef}
            onClick={togglePanel}
            className="flex items-center gap-2 text-lg font-bold text-black hover:text-gray-500 transition-colors"
          >
            Check your ticket
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          <div className="text-right">
            <AuthNav />
          </div>
        </div>

        {/* พื้นที่เนื้อหาที่ถูกควบคุมด้วย GSAP (เริ่มต้นที่ความสูง 0) */}
        <div
          ref={contentRef}
          className="h-0 opacity-0 overflow-hidden px-8 sm:px-12"
        >
          <div className="pb-8">
            {/* ส่วนแสดงตั๋ว (ด้านบน) */}
            <div className="w-full flex justify-center mb-8">
              <div className="w-full max-w-2xl bg-white border border-gray-300 shadow-sm h-32 flex items-center justify-center text-gray-400">
                [พื้นที่ใส่ภาพตั๋ว SWAN LAKE]
              </div>
            </div>

            {/* ส่วนข้อมูลแบ่ง 2 คอลัมน์ (ซ้าย-ขวา) มีเส้นคั่นตรงกลาง */}
            <div className="grid grid-cols-2 gap-4 mb-8 border-t border-gray-300 pt-8">
              {/* คอลัมน์ซ้าย: Ticket Info */}
              <div className="border-r border-gray-300 flex flex-col justify-center items-center relative min-h-[200px] overflow-hidden">
                <span className="absolute top-4 left-4 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  ticket info
                </span>
                <span className="absolute top-1/2 left-12 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  ticket info
                </span>
                <span className="absolute bottom-4 left-4 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  ticket info
                </span>
              </div>

              {/* คอลัมน์ขวา: User Info */}
              <div className="flex flex-col justify-center items-center relative min-h-[200px] overflow-hidden">
                <span className="absolute top-4 right-12 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  user info
                </span>
                <span className="absolute top-1/2 right-4 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  user info
                </span>
                <span className="absolute bottom-4 right-12 -rotate-12 text-gray-500 font-medium tracking-widest text-lg">
                  user info
                </span>
              </div>
            </div>

            {/* ปุ่มกดเพื่อหุบ Panel (อยู่ด้านล่างสุด) */}
            <div className="flex justify-center mt-4">
              <button
                onClick={togglePanel}
                className="flex items-center gap-2 text-lg font-bold text-red-300 hover:text-red-500 transition-colors duration-200"
              >
                Close
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 15.75 7.5-7.5 7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Sub-component for Navigation to avoid mixing too much logic
function AuthNav() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-black hover:text-amber-600 transition-colors"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
        >
          Admin
        </Link>
      )}
      <span className="text-sm text-gray-600">Hi, {user?.email}</span>
      <button
        onClick={logout}
        className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
