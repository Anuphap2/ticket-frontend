"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const togglePanel = () => setIsOpen((prev) => !prev);

  // ฟังก์ชันสำหรับปิด Panel เมื่อมีการกด Logout
  const handlePanelClose = () => {
    setIsOpen(false);
  };

  // Animate panel
  useEffect(() => {
    if (!panelRef.current || !buttonRef.current) return;

    const tl = gsap.timeline();

    if (isOpen) {
      tl.to(buttonRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        pointerEvents: "none",
      }).to(panelRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      tl.to(panelRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.inOut",
      }).to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          pointerEvents: "auto",
        },
        "-=0.2",
      );
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    >
      <div className="mx-auto max-w-5xl bg-white/80 backdrop-blur-md rounded-b-2xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between px-6">
          <div />

          {/* ซ่อนปุ่มเมื่อยังไม่ได้เข้าสู่ระบบ */}
          {isAuthenticated && (
            <button
              ref={buttonRef}
              onClick={togglePanel}
              className="flex items-center gap-2 text-lg border-dotted border-b-2 border-transparent font-semibold text-black hover:border-zinc-400 duration-200 transition-all"
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
          )}

          {/* ส่งฟังก์ชันปิด Panel เข้าไปใน AuthNav */}
          <AuthNav onLogoutAction={handlePanelClose} />
        </div>

        {/* ซ่อนเส้นกั้นและ Panel เมื่อยังไม่ได้เข้าสู่ระบบ */}
        {isAuthenticated && (
          <>
            {/* Divider */}
            <div className="w-11/12 h-px bg-zinc-200 mx-auto" />

            {/* Expandable Panel */}
            <div
              ref={panelRef}
              className="h-0 opacity-0 overflow-hidden px-8 sm:px-12 bg-transparent"
            >
              <div className="py-8">
                <div className="w-full flex justify-center mb-8">
                  <div className="w-full max-w-2xl bg-zinc-100/50 border border-zinc-300 shadow-sm h-32 flex items-center justify-center text-zinc-400">
                    [Your Ticket Preview]
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-8">
                  <div className="border-r border-zinc-200 text-center text-zinc-500">
                    Ticket Info
                  </div>
                  <div className="text-center text-zinc-500">User Info</div>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={togglePanel}
                    className="text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

// รับค่า Props จาก Navbar
function AuthNav({ onLogoutAction }: { onLogoutAction: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogoutClick = () => {
    onLogoutAction(); // ปิด Panel
    logout(); // ออกจากระบบ
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-black hover:text-amber-600 transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="group relative flex items-center h-[2.8em] py-[0.35em] pl-[1.2em] pr-[3.3em] text-sm font-medium text-white tracking-[0.05em] bg-black rounded-[1em] shadow-[inset_0_0_1.6em_-0.6em_#3f3f46] overflow-hidden transition-all"
        >
          {/* ข้อความจะเปลี่ยนเป็นสีดำเมื่อพื้นหลังสีขาวขยายตัวมาทับ */}
          <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
            Register
          </span>

          {/* ไอคอนและพื้นหลังสีขาวที่จะขยายตัว */}
          <div className="absolute right-[0.3em] z-20 flex items-center justify-center w-[2.2em] h-[2.2em] bg-white rounded-[0.75em] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:w-[calc(100%-0.6em)] active:scale-95">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[1.1em] text-black transition-transform duration-300 group-hover:translate-x-[0.1em]"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5">
      {user?.role === "admin" && (
        <Link
          href="/admin"
          className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
        >
          Admin
        </Link>
      )}

      <Link
        href="/my-bookings"
        className="text-sm font-medium text-zinc-600 hover:text-amber-600 transition-colors"
      >
        My Bookings
      </Link>

      <span className="text-sm text-zinc-500">{user?.email}</span>

      <button
        onClick={handleLogoutClick}
        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
