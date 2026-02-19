"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Booking } from "@/types";
import { Badge } from "@/components/ui";
import { Calendar, MapPin, QrCode, X } from "lucide-react";

export function TicketCard({ booking }: { booking: Booking }) {
  const [showFullTicket, setShowFullTicket] = useState(false);
  const event = booking.eventId as any;

  // 🎯 สร้างความสูงของ Barcode จาก ID (เพื่อให้ตั๋วใบเดิม ลายเดิมตลอดไป ไม่สุ่มมั่ว)
  const ticketVisuals = useMemo(() => {
    const idString = booking._id.toString();
    
    // สร้างลาย Barcode จาก Char Code ของ ID
    const strips = idString.split('').map((char, i) => {
      const charValue = char.charCodeAt(0);
      return {
        width: charValue % 2 === 0 ? "2px" : "3px", // กำหนดความหนาจากเลขคู่คี่
        height: `${50 + (charValue % 40)}%`,        // กำหนดความสูงจากค่า Char
      };
    });

    // เพิ่มแท่งให้ยาวพอ (เติมให้ครบ 40 แท่ง)
    while (strips.length < 40) {
      strips.push(strips[strips.length % strips.length]);
    }

    // QR Code URL (ใช้ HTTPS และ Encode ค่า ID ให้ปลอดภัย)
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(booking._id)}&choe=UTF-8&chld=L|2`;

    return { strips, qrUrl };
  }, [booking._id]);

  return (
    <>
      {/* Card หน้าหลัก */}
      <div
        onClick={() => setShowFullTicket(true)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 cursor-pointer hover:border-indigo-200 transition-all group"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge
              variant={booking.status === "confirmed" ? "default" : "outline"}
              className={booking.status === "confirmed" ? "bg-emerald-500 text-white" : ""}
            >
              {booking.status.toUpperCase()}
            </Badge>
            <span className="text-[10px] font-mono text-zinc-400">
              ID: {booking._id.slice(-6)}
            </span>
          </div>

          <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-indigo-600">
            {event?.title || "Unknown Event"}
          </h3>

          <div className="space-y-2 mb-6 text-sm text-zinc-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
              {event?.date ? format(new Date(event.date), "PPP p") : "TBA"}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
              {event?.location}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-100">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {booking.zoneName} • {booking.quantity} Seats
            </div>
            <QrCode className="text-zinc-300 group-hover:text-indigo-600" size={24} />
          </div>
        </div>
      </div>

      {/* Modal ตั๋วใบใหญ่ */}
      {showFullTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowFullTicket(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()} // กันกดโดนตั๋วแล้วปิด
          >
            {/* Close Button */}
            <button
              onClick={() => setShowFullTicket(false)}
              className="absolute top-6 right-6 z-10 bg-white/80 p-2 rounded-full text-zinc-500 hover:bg-zinc-100 shadow-md transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            {/* หัวตั๋ว */}
            <div className="h-32 bg-indigo-600 relative">
              {event?.imageUrl && (
                <img 
                  src={event.imageUrl} 
                  className="w-full h-full object-cover opacity-50" 
                  alt="" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <div className="absolute bottom-4 left-8">
                <h2 className="text-2xl font-black italic text-zinc-900 uppercase tracking-tighter">E-TICKET</h2>
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Event</h3>
                <p className="text-lg font-bold text-zinc-900 leading-tight">{event?.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date</h3>
                  <p className="text-sm font-bold">{event?.date ? format(new Date(event.date), "dd MMM yyyy") : "TBA"}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Seats</h3>
                  <p className="text-sm font-mono font-bold text-indigo-600">
                    {booking.tickets?.map((t: any) => t.seatNumber).join(", ") || `${booking.quantity} Total`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center pt-6 border-t-2 border-dashed border-zinc-100">
                {/* 🎯 QR Code ที่เสถียรขึ้น */}
                <div className="bg-zinc-50 p-3 rounded-2xl mb-6 border border-zinc-100">
                  <img 
                    src={ticketVisuals.qrUrl} 
                    alt="QR Code" 
                    className="w-40 h-40 mix-blend-multiply" // ช่วยให้สีขาวของรูปกลืนไปกับพื้นหลัง
                    onError={(e) => {
                      // Fallback ถ้า Google Chart พัง
                      (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking._id}`;
                    }}
                  />
                </div>

                {/* 🎯 Barcode ลายคงที่ตาม ID */}
                <div className="text-center w-full">
                  <div className="h-8 flex gap-[1.5px] items-end mb-2 justify-center">
                    {ticketVisuals.strips.map((style, i) => (
                      <div
                        key={i}
                        className="bg-zinc-900"
                        style={{ width: style.width, height: style.height }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-mono text-zinc-400 font-bold tracking-[0.4em] uppercase">
                    {booking._id.slice(-12)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-6 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Scan at the stadium entrance
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}