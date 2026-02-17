'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CalendarPlus, LogOut, Ticket } from 'lucide-react';
import { Button } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || user?.role !== 'admin') {
                router.push('/');
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

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/bookings', label: 'Manage Bookings', icon: Ticket },
        { href: '/admin/events/create', label: 'Create Event', icon: CalendarPlus },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl border-r border-zinc-200">
                <div className="flex h-16 items-center justify-center border-b border-zinc-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                </div>
                <nav className="mt-8 px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600'
                                    }`}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full border-t border-zinc-200 bg-zinc-50 p-4 space-y-2">
                    <Link href="../" className='block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors'>Home page</Link>
                    <Button variant="ghost" className="w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md" onClick={logout}>
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                <div className="max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
