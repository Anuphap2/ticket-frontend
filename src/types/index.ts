export interface User {
    _id: string;
    email: string;
    role: 'user' | 'admin';
}

export interface Zone {
    name: string;
    price: number;
    totalSeats: number;
    availableSeats: number;
}

export interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    imageUrl?: string;
    zones: Zone[];
    createdAt: string;
    updatedAt: string;
    type?: 'seated' | 'standing';
    rows?: number;
    seatsPerRow?: number;
    seats?: {
        seatNo: string;
        isAvailable: boolean;
    }[];
}

export interface Booking {
    _id: string;
    userId: string | {
        _id: string;
        name: string;
        email: string;
    };
    eventId: {
        _id: string;
        title: string;
        date: string;
        location: string;
    } | string; // Populated or ID
    zoneName: string;
    quantity: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    trackingId?: string;
    totalPrice: number; // Backend sends this
    event?: Event; // Some endpoints might populate this field instead of eventId
    createdAt: string;
}
