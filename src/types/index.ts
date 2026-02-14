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
    zones: Zone[];
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    _id: string;
    userId: string;
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
    createdAt: string;
}
