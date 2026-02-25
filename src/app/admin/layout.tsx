"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarPlus,
  LogOut,
  Ticket,
  Users,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Manage Bookings", icon: Ticket },
    { href: "/admin/events/create", label: "Create Event", icon: CalendarPlus },
    { href: "/admin/users", label: "Manage Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100">
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow flex items-center px-4 z-40">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-zinc-700" />
        </button>
        <h1 className="ml-4 font-bold text-indigo-600">Admin Panel</h1>
      </div>

      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200">
          <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>

          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
          data-lenis-prevent="true"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)} // ✅ ปิดตอนกด
                className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-indigo-600"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-zinc-200 p-4 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            Home page
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen md:ml-64 pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
