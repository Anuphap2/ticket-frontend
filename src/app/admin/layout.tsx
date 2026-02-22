"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, CalendarPlus, LogOut, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
        {/* ส่วนหัว */}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-zinc-200">
          <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
        </div>

        {/* เมนูหลักตรงกลาง (เลื่อนหน้าจอได้ถ้าเมนูยาวเกินไป) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
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

        {/* ส่วนล่างสุด (ปุ่ม Home และ Logout) */}
        <div className="mt-auto shrink-0 w-full border-t border-zinc-200 p-4 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center w-full justify-start rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Home page
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
