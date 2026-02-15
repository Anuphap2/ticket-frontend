import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classNames, or use standard className

interface SeatMapProps {
    rows: number;
    seatsPerRow: number;
    takenSeats: string[]; // ['A1', 'B2']
    selectedSeats: string[];
    onSeatClick: (seatNo: string) => void;
    price: number;
}

export function SeatMap({ rows, seatsPerRow, takenSeats, selectedSeats, onSeatClick, price }: SeatMapProps) {
    // Generate seat grid
    const renderSeats = () => {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const rowLabel = String.fromCharCode(65 + r); // A, B, C...
            const rowSeats = [];

            for (let s = 1; s <= seatsPerRow; s++) {
                const seatNo = `${rowLabel}${s}`;
                const isTaken = takenSeats.includes(seatNo);
                const isSelected = selectedSeats.includes(seatNo);

                rowSeats.push(
                    <button
                        key={seatNo}
                        disabled={isTaken}
                        onClick={() => onSeatClick(seatNo)}
                        className={cn(
                            "w-8 h-8 m-1 rounded-t-lg text-xs font-bold transition-all duration-200 flex items-center justify-center border-t-4",
                            isTaken
                                ? "bg-zinc-300 text-zinc-400 cursor-not-allowed border-zinc-400"
                                : isSelected
                                    ? "bg-indigo-600 text-white border-indigo-800 scale-110 shadow-lg shadow-indigo-500/50"
                                    : "bg-white border-zinc-300 text-zinc-700 hover:bg-indigo-50 hover:border-indigo-300"
                        )}
                        title={isTaken ? `Seat ${seatNo} (Taken)` : `Seat ${seatNo} - ฿${price}`}
                    >
                        {s}
                    </button>
                );
            }

            grid.push(
                <div key={rowLabel} className="flex items-center gap-2 mb-2">
                    <div className="w-6 text-center font-bold text-zinc-400">{rowLabel}</div>
                    <div className="flex flex-wrap justify-center">{rowSeats}</div>
                    <div className="w-6 text-center font-bold text-zinc-400">{rowLabel}</div>
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="flex flex-col items-center p-6 bg-zinc-50 rounded-xl border border-zinc-200 overflow-x-auto">
            <div className="w-full max-w-2xl text-center mb-8">
                <div className="w-3/4 h-2 bg-zinc-300 mx-auto mb-2 rounded-full shadow-inner"></div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stage / Screen</span>
            </div>

            <div className="mb-8">
                {renderSeats()}
            </div>

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
                    <div className="w-4 h-4 bg-zinc-300 border-t-4 border-zinc-400 rounded-t-lg"></div>
                    <span>Taken</span>
                </div>
            </div>
        </div>
    );
}
