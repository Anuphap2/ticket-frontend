"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { User } from "@/types";
import Link from "next/link";
import {
  Mail,
  Phone,
  ShieldCheck,
  Edit3,
  ArrowLeft,
  Loader2,
  Sparkles,
  Ticket,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (err) {
        console.error("❌ fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (!user) return <ErrorMessage message="ไม่พบข้อมูลผู้ใช้" />;

  const userInitial = user.firstName?.[0]?.toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-6 antialiased">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation */}
        <Link
          href="/"
          className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 mb-10 transition-colors"
        >
          <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-zinc-100 overflow-hidden relative"
        >
          {/* Header Banner - เน้นงานดีไซน์ ไม่เน้นที่วางรูป */}
          <div className="relative h-40 bg-zinc-950 flex items-center px-10 overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
             
             {/* 🎯 Emblem: ใช้ตัวย่อชื่อเป็นดีไซน์โลโก้แทนรูปโปรไฟล์ */}
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 flex items-center justify-center rotate-3 border-2 border-white/10">
                   <span className="text-3xl font-black text-white italic">{userInitial}</span>
                </div>
                <div>
                   <h2 className="text-white font-black text-2xl tracking-tighter uppercase italic leading-none">
                      {user.firstName} <span className="text-indigo-400">{user.lastName}</span>
                   </h2>
                   <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">Verified Ticket Holder</p>
                </div>
             </div>
          </div>

          <div className="p-10 md:p-14">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div className="space-y-1">
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                   <Sparkles size={12} className="text-amber-400" /> Account Status: Active
                </p>
                <h3 className="text-sm font-bold text-zinc-900">Personal Information</h3>
              </div>

              <Link
                href="/profile/edit"
                className="flex items-center gap-2 px-6 py-3 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
              >
                <Edit3 size={14} /> Edit Details
              </Link>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<Mail className="text-indigo-600" size={18} />}
                label="Registered Email"
                value={user.email}
              />
              <InfoCard
                icon={<Phone className="text-indigo-600" size={18} />}
                label="Contact Number"
                value={user.phone || "Not specified"}
              />
              <div className="md:col-span-2">
                <InfoCard
                  icon={<ShieldCheck className="text-indigo-600" size={18} />}
                  label="National Identity"
                  value={user.nationalId ? `•••• •••• •••• ${user.nationalId.slice(-4)}` : "Verified Identity"}
                />
              </div>
            </div>

            {/* Account Quick Links */}
            <div className="mt-10 grid grid-cols-1 gap-3">
               <Link href="/my-bookings" className="flex items-center justify-between p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-50 transition-colors group">
                  <div className="flex items-center gap-4">
                     <Ticket className="text-indigo-600" size={20} />
                     <span className="text-xs font-black uppercase tracking-widest text-indigo-900">View My Ticket Collection</span>
                  </div>
                  <ArrowLeft size={16} className="rotate-180 text-indigo-400 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            {/* Security Footer */}
            <div className="mt-12 pt-8 border-t border-zinc-50 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">End-to-End Encrypted Session</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string; }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white border border-zinc-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-zinc-50 text-zinc-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-1 leading-none">
            {label}
          </p>
          <p className="text-sm font-bold text-zinc-800 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Syncing Profile...</p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-100 text-center">
        <h2 className="text-xl font-black uppercase italic tracking-tight mb-2 text-zinc-900">Access Denied</h2>
        <p className="text-zinc-500 text-sm mb-8 font-medium">{message}</p>
        <Link href="/" className="inline-block px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
           Return to Home
        </Link>
      </div>
    </div>
  );
}