"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  rows: number;
  seatsPerRow: number;
  takenSeats: string[];
  selectedSeats: string[];
  onSeatClick: (seatNo: string) => void;
  price: number;
  selectedZone: string;
}

export function SeatMap({
  rows,
  seatsPerRow,
  takenSeats,
  selectedSeats,
  onSeatClick,
  selectedZone,
  price,
}: SeatMapProps) {
  const renderSeats = () => {
    const grid = [];

    // 🎯 วนลูปตามจำนวนแถว (r)
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A, B, C...
      const rowSeats = [];

      // 🎯 วนลูปตามจำนวนที่นั่งต่อแถว (s)
      for (let s = 1; s <= seatsPerRow; s++) {
        // 🚀 คำนวณลำดับที่นั่งจริง (1, 2, 3...) แบบยาวต่อเนื่องทุกแถว
        // เพื่อให้ที่นั่งแต่ละใบมี ID ไม่ซ้ำกัน (Unique ID)
        const seatIndex = r * seatsPerRow + s;

        // 🚀 สร้าง ID ให้ตรงกับใน Database (เช่น "Zone A1", "Zone A11")
        const seatNo = `${selectedZone}${seatIndex}`;

        const isTaken = takenSeats.includes(seatNo);
        const isSelected = selectedSeats.includes(seatNo);

        rowSeats.push(
          <button
            key={seatNo}
            disabled={isTaken}
            onClick={() => onSeatClick(seatNo)}
            className={cn(
              "w-8 h-8 m-1 rounded-t-lg text-[10px] font-bold transition-all duration-200 flex items-center justify-center border-t-4",
              isTaken
                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed border-zinc-800 opacity-50"
                : isSelected
                  ? "bg-indigo-600 text-white border-indigo-800 scale-110 shadow-lg shadow-indigo-500/50"
                  : "bg-white border-zinc-300 text-zinc-700 hover:bg-indigo-50 hover:border-indigo-300",
            )}
            title={
              isTaken ? `Seat ${seatNo} (Taken)` : `Seat ${seatNo} - ฿${price}`
            }
          >
            {/* แสดงเลขที่นั่งในแถว (1, 2, 3...) หรือจะเปลี่ยนเป็น seatIndex ก็ได้ถ้าในตั๋วเป็นเลขเรียง */}
            {s}
          </button>,
        );
      }

      // ยัดแถวที่สร้างเสร็จแล้วลงใน grid
      grid.push(
        <div key={rowLabel} className="flex items-center gap-2 mb-2">
          <div className="w-6 text-center font-bold text-zinc-400">
            {rowLabel}
          </div>
          <div className="flex flex-wrap justify-center">{rowSeats}</div>
          <div className="w-6 text-center font-bold text-zinc-400">
            {rowLabel}
          </div>
        </div>,
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center p-6 bg-zinc-50 rounded-xl border border-zinc-200 overflow-x-auto">
      <div className="w-full max-w-2xl text-center mb-8">
        <div className="w-3/4 h-2 bg-zinc-300 mx-auto mb-2 rounded-full shadow-inner"></div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Stage / Screen
        </span>
      </div>

      <div className="mb-8">{renderSeats()}</div>

      {/* Legend ส่วนอธิบายสี */}
      <div className="flex gap-6 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-t-4 border-zinc-300 rounded-t-lg"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 border-t-4 border-indigo-800 rounded-t-lg"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zinc-700 border-t-4 border-zinc-800 rounded-t-lg"></div>
          <span>Taken</span>
        </div>
      </div>
    </div>
  );
}
