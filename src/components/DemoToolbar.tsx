"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { mockStore } from "@/lib/mockStore";
import toast from "react-hot-toast";
import {
  Sparkles,
  User,
  Shield,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Ticket,
  LayoutDashboard,
} from "lucide-react";

export function DemoToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const handleSwitchRole = async (email: string, roleName: string) => {
    try {
      const res = await authService.login({ email, password: "password123" });
      const { access_token, refresh_token } = res;
      const profile = await authService.getProfile(access_token);
      login(access_token, refresh_token, profile);
      toast.success(`Switched to Demo ${roleName}!`);
      if (email === "admin@demo.com") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      toast.error("Failed to switch role");
    }
  };

  const handleResetData = () => {
    mockStore.resetToInitial();
    toast.success("Demo data reset to pristine state!");
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <aside aria-label="Portfolio Demo Controls" className="fixed bottom-4 right-4 z-50 select-none">
      {/* ── Mini Pill Button ──────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900/95 hover:bg-black text-white rounded-full shadow-2xl border border-zinc-700/60 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold tracking-tight">Portfolio Demo</span>
          <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform" />
        </button>
      )}

      {/* ── Expanded Drawer / Popover ────────────────────── */}
      {isOpen && (
        <div className="w-80 md:w-92 bg-zinc-950 text-white rounded-3xl shadow-2xl border border-zinc-800 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">Portfolio Web Demo</h4>
                <p className="text-[10px] text-zinc-400 font-medium">Standalone • Zero Backend Required</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Auth Status */}
          <div className="p-3 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Role</span>
              <p className="font-bold text-zinc-200 flex items-center gap-1.5">
                {isAuthenticated ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {user?.firstName || user?.email} ({user?.role})
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    Guest Visitor
                  </>
                )}
              </p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
              >
                Sign out
              </button>
            ) : null}
          </div>

          {/* Quick Switch Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              Quick Role Switcher
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSwitchRole("user@demo.com", "User")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isAuthenticated && !isAdmin
                    ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Customer
              </button>

              <button
                onClick={() => handleSwitchRole("admin@demo.com", "Admin")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isAdmin
                    ? "bg-purple-600/30 border-purple-500 text-purple-300"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Admin Panel
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full py-2 px-3 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Open Admin Dashboard
              </button>
            )}
          </div>

          {/* Actions & Utilities */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>

            <button
              onClick={() => router.push("/my-bookings")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 font-medium transition-colors cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              My Tickets
            </button>
          </div>

          {/* GitHub Links */}
          <div className="p-2.5 bg-zinc-900/50 rounded-xl flex items-center justify-between text-[11px] text-zinc-400 border border-zinc-800/40">
            <span>Source Repositories:</span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Anuphap2/ticket"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-0.5 underline font-medium"
              >
                Backend <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span>•</span>
              <a
                href="https://github.com/Anuphap2/ticket-frontend"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-0.5 underline font-medium"
              >
                Frontend <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
