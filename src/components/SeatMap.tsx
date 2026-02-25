"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

// Helper ฟังก์ชันสำหรับแปลงตัวเลขเป็น A, B, ..., Z, AA, AB, ...
const getRowLabel = (index: number) => {
  let label = "";
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
};

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
  // อัปเดตลิมิตเป็น 100
  const clampedRows = Math.min(rows, 100);
  const clampedSeats = Math.min(seatsPerRow, 100);

  // We split each row into left half and right half with an aisle in the centre
  const half = Math.ceil(clampedSeats / 2);

  const stats = useMemo(() => {
    const total = clampedRows * clampedSeats;
    const taken = takenSeats.length;
    const selected = selectedSeats.length;
    return { total, taken, selected };
  }, [clampedRows, clampedSeats, takenSeats, selectedSeats]);

  return (
    <div className="flex flex-col w-full bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-b-3xl overflow-hidden select-none">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-white/5 text-[9px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-4 h-3.5 rounded-t-[3px] border-b-2 bg-zinc-700 border-zinc-600 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-4 h-3.5 rounded-t-[3px] border-b-2 bg-indigo-500 border-indigo-700 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-4 h-3.5 rounded-t-[3px] border-b-2 bg-zinc-800 border-zinc-900 opacity-50 inline-block" />
          Taken
        </span>
      </div>

      {/* Stage */}
      <div className="flex flex-col items-center pt-6 pb-2">
        <div className="relative w-3/4 max-w-sm">
          {/* Glow */}
          <div className="absolute -inset-1 bg-emerald-500/10 blur-xl rounded-full" />
          <div className="relative h-7 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 rounded-b-[2rem] border-x border-b border-zinc-600 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <span className="text-[8px] font-black tracking-[0.5em] text-zinc-400 uppercase ml-[0.5em]">
              STAGE
            </span>
          </div>
        </div>
        {/* Curved screen glow line */}
        <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent mt-1" />
      </div>

      {/* Seat Grid */}
      <div
        className="overflow-y-auto overflow-x-auto px-4 py-4"
        style={{ maxHeight: "65vh" }}
      >
        <div className="flex flex-col items-center gap-[3px] min-w-max mx-auto">
          {Array.from({ length: clampedRows }, (_, r) => {
            const rowLabel = getRowLabel(r); // ใช้ฟังก์ชันแปลง A-ZZ แทน
            const leftSeats = Array.from({ length: half }, (_, s) => s);
            const rightSeats = Array.from(
              { length: clampedSeats - half },
              (_, s) => s + half,
            );

            return (
              <div key={rowLabel} className="flex items-center gap-1">
                {/* Row label left - ปรับ w-5 เป็น w-6 เพื่อรองรับอักษร 2 ตัว */}
                <span className="w-6 text-center text-[9px] font-black text-zinc-600 font-mono shrink-0">
                  {rowLabel}
                </span>

                {/* Left block */}
                <div className="flex gap-[3px]">
                  {leftSeats.map((s) => {
                    // ใช้ชื่อที่นั่งแบบอักษรตามด้วยเลข (เช่น A1, AA12) ให้ตรงกับฐานข้อมูล
                    const seatNo = `${rowLabel}${s + 1}`;
                    const isTaken = takenSeats.includes(seatNo);
                    const isSelected = selectedSeats.includes(seatNo);
                    return (
                      <Seat
                        key={seatNo}
                        seatNo={seatNo}
                        label={String(s + 1)}
                        isTaken={isTaken}
                        isSelected={isSelected}
                        price={price}
                        onClick={() => onSeatClick(seatNo)}
                      />
                    );
                  })}
                </div>

                {/* Aisle gap */}
                <div className="w-5 shrink-0" />

                {/* Right block */}
                <div className="flex gap-[3px]">
                  {rightSeats.map((s) => {
                    const seatNo = `${rowLabel}${s + 1}`;
                    const isTaken = takenSeats.includes(seatNo);
                    const isSelected = selectedSeats.includes(seatNo);
                    return (
                      <Seat
                        key={seatNo}
                        seatNo={seatNo}
                        label={String(s + 1)}
                        isTaken={isTaken}
                        isSelected={isSelected}
                        price={price}
                        onClick={() => onSeatClick(seatNo)}
                      />
                    );
                  })}
                </div>

                {/* Row label right - ปรับ w-5 เป็น w-6 */}
                <span className="w-6 text-center text-[9px] font-black text-zinc-600 font-mono shrink-0">
                  {rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5 text-[9px] font-bold uppercase tracking-wider">
        <span className="text-zinc-600">
          {stats.total} total · {stats.taken} taken
        </span>
        {stats.selected > 0 ? (
          <span className="text-indigo-400 font-black">
            {stats.selected} selected · ฿
            {(stats.selected * price).toLocaleString()}
          </span>
        ) : (
          <span className="text-zinc-600">Click a seat to select · Max 6</span>
        )}
      </div>
    </div>
  );
}

// Individual Seat Component
interface SeatProps {
  seatNo: string;
  label: string;
  isTaken: boolean;
  isSelected: boolean;
  price: number;
  onClick: () => void;
}

function Seat({
  seatNo,
  label,
  isTaken,
  isSelected,
  price,
  onClick,
}: SeatProps) {
  return (
    <button
      disabled={isTaken}
      onClick={onClick}
      title={
        isTaken ? `${seatNo} · Taken` : `${seatNo} · ฿${price.toLocaleString()}`
      }
      className={cn(
        // Base: armchair silhouette shape
        "w-5 h-4 rounded-t-[4px] border-b-[3px] text-[6px] font-black transition-all duration-150 flex items-center justify-center leading-none",
        isTaken
          ? "bg-zinc-800 border-zinc-900 text-zinc-700 cursor-not-allowed opacity-40"
          : isSelected
            ? "bg-indigo-500 border-indigo-700 text-white shadow-[0_0_8px_rgba(99,102,241,0.6)] scale-110 z-10"
            : "bg-zinc-700 border-zinc-600 text-zinc-500 hover:bg-indigo-400 hover:border-indigo-600 hover:text-white hover:scale-110 hover:z-10 cursor-pointer",
      )}
    >
      {label}
    </button>
  );
}
