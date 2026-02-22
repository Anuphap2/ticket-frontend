export interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  phone?: string;
  nationalId?: string;
}

export interface Zone {
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  type?: "seated" | "standing" | string;
  rows?: number;
  seatsPerRow?: number;
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
  type?: "seated" | "standing";
  rows?: number;
  seatsPerRow?: number;
  seats?: {
    seatNo: string;
    isAvailable: boolean;
  }[];
  status: string;
}

export interface Booking {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  eventId:
    | {
        _id: string;
        title: string;
        date: string;
        location: string;
      }
    | string; // Populated or ID
  zoneName: string;
  quantity: number;
  status: "pending" | "confirmed" | "cancelled";
  seatNumbers?: string[];
  trackingId?: string;
  totalPrice: number; // Backend sends this
  price: number; // Price per ticket, useful for frontend calculations
  event?: Event; // Some endpoints might populate this field instead of eventId
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  tickets?: any[];
}

export interface Ticket {
  _id: string;
  eventId: string | any;
  seatNumber: string;
  zoneName: string;
  status: "available" | "reserved" | "sold" | string;
  userId?: string | any;
  createdAt?: string;
  updatedAt?: string;
}
