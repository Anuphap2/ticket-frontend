"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Booking } from "@/types";
import { Badge } from "@/components/ui";
import { Calendar, MapPin, QrCode, X } from "lucide-react";

export function TicketCard({ booking }: { booking: Booking }) {
  const [showFullTicket, setShowFullTicket] = useState(false);
  const event = booking.eventId as any;

  // 🔒 Lock scroll + ESC to close
  useEffect(() => {
    if (showFullTicket) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFullTicket(false);
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [showFullTicket]);

  // 🎯 Stable visuals based on ID
  const ticketVisuals = useMemo(() => {
    const idString = booking._id.toString();

    const strips = idString.split("").map((char) => {
      const charValue = char.charCodeAt(0);
      return {
        width: charValue % 2 === 0 ? "2px" : "3px",
        height: `${50 + (charValue % 40)}%`,
      };
    });

    while (strips.length < 40) {
      strips.push(strips[strips.length % idString.length]);
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${booking._id}`;

    return { strips, qrUrl };
  }, [booking._id]);

  return (
    <>
      {/* 🎫 Card */}
      <div
        onClick={() => setShowFullTicket(true)}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Badge
              variant={booking.status === "confirmed" ? "default" : "outline"}
              className={
                booking.status === "confirmed"
                  ? "bg-emerald-500 text-white"
                  : ""
              }
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
            <QrCode
              className="text-zinc-300 group-hover:text-indigo-600"
              size={24}
            />
          </div>
        </div>
      </div>

      {/* 🎟 Modal */}
      {showFullTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowFullTicket(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ❌ Close */}
            <button
              onClick={() => setShowFullTicket(false)}
              className="absolute top-6 right-6 z-10 bg-white/80 p-2 rounded-full text-zinc-500 hover:bg-zinc-100 shadow-md transition-all active:scale-90"
            >
              <X size={20} />
            </button>

            {/* 🎨 Header */}
            <div className="h-36 bg-gradient-to-r from-indigo-600 to-purple-600 relative flex items-end px-8 pb-4">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
                E-TICKET
              </h2>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  Event
                </h3>
                <p className="text-lg font-bold text-zinc-900 leading-tight">
                  {event?.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                    Date
                  </h3>
                  <p className="text-sm font-bold">
                    {event?.date
                      ? format(new Date(event.date), "dd MMM yyyy")
                      : "TBA"}
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                    Seats
                  </h3>
                  <p className="text-sm font-mono font-bold text-indigo-600">
                    {booking.tickets
                      ?.map((t: any) => t.seatNumber)
                      .join(", ") || `${booking.quantity} Total`}
                  </p>
                </div>
              </div>

              {/* 🔳 QR */}
              <div className="flex flex-col items-center pt-6 border-t-2 border-dashed border-zinc-100">
                <div className="bg-zinc-50 p-4 rounded-2xl mb-6 border border-zinc-100 shadow-inner">
                  <img
                    src={ticketVisuals.qrUrl}
                    alt="QR Code"
                    className="w-44 h-44"
                  />
                </div>

                {/* 📊 Barcode */}
                <div className="text-center w-full">
                  <div className="h-8 flex gap-[1.5px] items-end mb-2 justify-center">
                    {ticketVisuals.strips.map((style, i) => (
                      <div
                        key={i}
                        className="bg-zinc-900"
                        style={{
                          width: style.width,
                          height: style.height,
                        }}
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
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                Scan at the entrance
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
