"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/services/bookingService";
import { userService } from "@/services/userService"; // 🎯 อย่าลืมสร้างไฟล์นี้นะครับ
import { Button, Card, Badge } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Loader2,
} from "lucide-react";
import { Booking, User as UserType } from "@/types";
import { toast } from "react-hot-toast";

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🎯 1. ฟังก์ชันดึงข้อมูลแบบรวมศูนย์
  const fetchData = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลการจองและข้อมูลผู้ใช้มาพร้อมกัน
      const [bookingRes, userRes] = await Promise.all([
        bookingService.getAllForAdmin(page, 10),
        userService.getAll(),
      ]);

      setBookings(bookingRes.data || []);
      setTotalPages(bookingRes.totalPages || 1);

      // เก็บก้อน User ไว้สำหรับทำ Lookup
      const userData = Array.isArray(userRes)
        ? userRes
        : (userRes as any).data || [];
      setUsers(userData);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("ไม่สามารถซิงค์ข้อมูลล่าสุดได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  // 🎯 2. Logic การเทียบ ID เพื่อหาชื่อและเบอร์โทร
  const getCustomerDetail = (userId: any) => {
    // ป้องกันกรณี userId เป็น Object หรือ String
    const idToFind = typeof userId === "object" ? userId?._id : userId;
    const found = users.find((u) => u._id === idToFind);

    return {
      name: found ? `${found.firstName} ${found.lastName}` : "Guest User",
      phone: found?.phoneNumber || "ไม่ระบุเบอร์",
      email: found?.email || "No Email",
    };
  };

  const handleAction = async (id: string, action: string) => {
    const confirmAction = window.confirm(`ยืนยันการทำรายการ ${action}?`);
    if (!confirmAction) return;

    try {
      setLoading(true);
      if (action === "confirm")
        await bookingService.updateStatus(id, "confirmed");
      else if (action === "cancel")
        await bookingService.updateStatus(id, "cancelled");
      else if (action === "refund") await bookingService.refund(id);
      else if (action === "delete") await bookingService.delete(id);

      toast.success("ดำเนินการเรียบร้อย");
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen antialiased">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter italic uppercase leading-none">
            Booking <span className="text-indigo-600">Vault</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Transaction Management & Customer Audit
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="rounded-2xl bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 font-black text-[10px] uppercase tracking-widest h-12 px-6 hover:bg-zinc-900 hover:text-white transition-all duration-500"
        >
          <RefreshCcw
            size={14}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Sync Database
        </Button>
      </header>

      <Card className="overflow-hidden border-none shadow-[0_30px_100px_rgba(0,0,0,0.04)] rounded-[2.5rem] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-6">Event Context</th>
                <th className="px-8 py-6">Customer Identity</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Net Value</th>
                <th className="px-8 py-6 text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-40 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-indigo-600 mb-4"
                      size={40}
                    />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300">
                      Loading Assets
                    </span>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const customer = getCustomerDetail(booking.userId);
                  const eventTitle =
                    (booking.eventId as any)?.title || "Unknown Event";

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-zinc-50/50 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="font-black text-zinc-900 uppercase italic tracking-tight">
                          {eventTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-[9px] border-zinc-200 text-zinc-400 font-bold px-2 rounded-lg uppercase"
                          >
                            {booking.zoneName}
                          </Badge>
                          <span className="text-[10px] text-indigo-400 font-black tracking-tighter">
                            x{booking.quantity} SEATS
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                            <User size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-900 text-sm uppercase tracking-tight">
                              {customer.name}
                            </span>
                            <div className="flex items-center gap-2 text-zinc-400 mt-1 font-bold">
                              <Phone size={10} className="text-indigo-500" />
                              <span className="text-[11px] tracking-widest">
                                {customer.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-center">
                        <StatusBadge status={booking.status} />
                      </td>

                      <td className="px-8 py-6 text-right font-black text-zinc-900 tracking-tighter text-xl italic">
                        ฿{booking.totalPrice?.toLocaleString()}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                          {booking.status === "pending" && (
                            <ActionButton
                              icon={<CheckCircle size={18} />}
                              label="Approve"
                              onClick={() =>
                                handleAction(booking._id, "confirm")
                              }
                              color="text-emerald-500 hover:bg-emerald-50"
                            />
                          )}
                          {booking.status === "confirmed" && (
                            <ActionButton
                              icon={<RefreshCcw size={18} />}
                              label="Refund"
                              onClick={() =>
                                handleAction(booking._id, "refund")
                              }
                              color="text-amber-500 hover:bg-amber-50"
                            />
                          )}
                          <ActionButton
                            icon={<XCircle size={18} />}
                            label="Cancel"
                            onClick={() => handleAction(booking._id, "cancel")}
                            color="text-rose-400 hover:bg-rose-50"
                          />
                          <ActionButton
                            icon={<Trash2 size={18} />}
                            label="Delete"
                            onClick={() => handleAction(booking._id, "delete")}
                            color="text-zinc-300 hover:text-zinc-900"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center font-black">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest italic">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-6 font-black text-[10px] uppercase shadow-sm bg-white"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} className="mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl px-6 font-black text-[10px] uppercase shadow-sm bg-white"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    confirmed:
      "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50",
    cancelled:
      "bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100/50",
    refunded:
      "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50",
    pending:
      "bg-sky-50 text-sky-600 border-sky-100 shadow-sm shadow-sky-100/50",
  };
  return (
    <span
      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${config[status] || "bg-zinc-100 text-zinc-400 border-zinc-200"}`}
    >
      {status}
    </span>
  );
};

const ActionButton = ({ icon, label, onClick, color }: any) => (
  <button
    title={label}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`p-2.5 rounded-xl transition-all active:scale-75 ${color}`}
  >
    {icon}
  </button>
);

export default ManageBookingsPage;
