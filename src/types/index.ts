// ─── DTOs (for request bodies) ───────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  zones: Omit<Zone, 'availableSeats'>[];
  status?: string;
}

export interface CreateBookingDto {
  eventId: string;
  zoneName: string;
  quantity: number;
  seatNumbers?: string[];
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  phone?: string;
  nationalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  name: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  type?: 'seated' | 'standing' | string;
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
  type?: 'seated' | 'standing';
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
  userId: string | { _id: string; name: string; email: string };
  eventId:
  | { _id: string; title: string; date: string; location: string }
  | string;
  zoneName: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  seatNumbers?: string[];
  trackingId?: string;
  totalPrice: number;
  price: number;
  event?: Event;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  tickets?: Ticket[];
}

export interface Ticket {
  _id: string;
  eventId: string | Event;
  seatNumber: string;
  zoneName: string;
  status: 'available' | 'reserved' | 'sold' | string;
  userId?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Shared API response types ─────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}
