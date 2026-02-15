export interface Seat {
    seatNo: string;
    isAvailable: boolean;
}

export const generateSeats = (rows: number, seatsPerRow: number): Seat[] => {
    const seats: Seat[] = [];
    for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r); // A, B, C...
        for (let s = 1; s <= seatsPerRow; s++) {
            seats.push({
                seatNo: `${rowLabel}${s}`,
                isAvailable: true,
            });
        }
    }
    return seats;
};
