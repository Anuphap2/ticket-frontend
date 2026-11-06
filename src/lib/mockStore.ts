import { User, Event, Booking, Ticket, CreateEventDto } from '@/types';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_BOOKINGS,
  generateInitialTickets,
} from './mockData';

const USERS_KEY = 'demo_ticket_users';
const EVENTS_KEY = 'demo_ticket_events';
const TICKETS_KEY = 'demo_ticket_tickets';
const BOOKINGS_KEY = 'demo_ticket_bookings';
const QUEUES_KEY = 'demo_ticket_queues';

// Safe localStorage helper
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

const safeSetItem = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save to localStorage (${key})`, err);
  }
};

export interface QueueRecord {
  trackingId: string;
  bookingId: string;
  userId: string;
  eventId: string;
  zoneName: string;
  quantity: number;
  seatNumbers?: string[];
  totalPrice: number;
  attempts: number;
  status: 'waiting' | 'confirmed' | 'failed';
  createdAt: number;
}

export const mockStore = {
  // Check if running in demo mode
  isDemoMode: (): boolean => {
    if (typeof window === 'undefined') return true;
    return process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
  },

  // Reset demo data to pristine initial state
  resetToInitial: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(
      TICKETS_KEY,
      JSON.stringify(generateInitialTickets(INITIAL_EVENTS))
    );
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.removeItem(QUEUES_KEY);
  },

  // ─── Users ──────────────────────────────────────────────────────────
  getUsers: (): User[] => {
    return safeGetItem<User[]>(USERS_KEY, INITIAL_USERS);
  },

  getUserById: (id: string): User | undefined => {
    const users = mockStore.getUsers();
    return users.find((u) => u._id === id);
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = mockStore.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  saveUser: (user: User): User => {
    const users = mockStore.getUsers();
    const idx = users.findIndex((u) => u._id === user._id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push(user);
    }
    safeSetItem(USERS_KEY, users);
    return user;
  },

  updateUser: (id: string, partial: Partial<User>): User | null => {
    const users = mockStore.getUsers();
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...partial, updatedAt: new Date().toISOString() };
    safeSetItem(USERS_KEY, users);
    return users[idx];
  },

  deleteUser: (id: string): boolean => {
    const users = mockStore.getUsers().filter((u) => u._id !== id);
    safeSetItem(USERS_KEY, users);
    return true;
  },

  // ─── Events ─────────────────────────────────────────────────────────
  getEvents: (): Event[] => {
    return safeGetItem<Event[]>(EVENTS_KEY, INITIAL_EVENTS);
  },

  getEventById: (id: string): Event | undefined => {
    const events = mockStore.getEvents();
    return events.find((e) => e._id === id);
  },

  createEvent: (dto: CreateEventDto): Event => {
    const events = mockStore.getEvents();
    const newId = `evt_${Date.now()}`;
    const newEvent: Event = {
      _id: newId,
      title: dto.title,
      description: dto.description,
      date: dto.date,
      location: dto.location,
      imageUrl:
        dto.imageUrl ||
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
      status: dto.status || 'active',
      zones: dto.zones.map((z) => ({
        ...z,
        availableSeats: z.totalSeats,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.unshift(newEvent);
    safeSetItem(EVENTS_KEY, events);

    // Also auto-generate tickets for seated zones
    const newTickets = generateInitialTickets([newEvent]);
    const existingTickets = mockStore.getAllTickets();
    safeSetItem(TICKETS_KEY, [...newTickets, ...existingTickets]);

    return newEvent;
  },

  updateEvent: (id: string, partial: Partial<Event>): Event | null => {
    const events = mockStore.getEvents();
    const idx = events.findIndex((e) => e._id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...partial, updatedAt: new Date().toISOString() };
    safeSetItem(EVENTS_KEY, events);
    return events[idx];
  },

  deleteEvent: (id: string): boolean => {
    const events = mockStore.getEvents().filter((e) => e._id !== id);
    safeSetItem(EVENTS_KEY, events);
    return true;
  },

  // ─── Tickets ────────────────────────────────────────────────────────
  getAllTickets: (): Ticket[] => {
    return safeGetItem<Ticket[]>(
      TICKETS_KEY,
      generateInitialTickets(INITIAL_EVENTS)
    );
  },

  getTicketsByEvent: (eventId: string): Ticket[] => {
    const all = mockStore.getAllTickets();
    return all.filter((t) => {
      const eid = typeof t.eventId === 'string' ? t.eventId : t.eventId?._id;
      return eid === eventId;
    });
  },

  markSeatsTaken: (
    eventId: string,
    zoneName: string,
    seatNumbers: string[]
  ): void => {
    const all = mockStore.getAllTickets();
    const updated = all.map((t) => {
      const eid = typeof t.eventId === 'string' ? t.eventId : t.eventId?._id;
      if (eid === eventId && t.zoneName === zoneName && seatNumbers.includes(t.seatNumber)) {
        return { ...t, status: 'sold', updatedAt: new Date().toISOString() };
      }
      return t;
    });
    safeSetItem(TICKETS_KEY, updated);
  },

  // ─── Bookings ───────────────────────────────────────────────────────
  getBookings: (): Booking[] => {
    return safeGetItem<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS);
  },

  getBookingById: (id: string): Booking | undefined => {
    const bookings = mockStore.getBookings();
    return bookings.find((b) => b._id === id);
  },

  getUserBookings: (userId: string): Booking[] => {
    const bookings = mockStore.getBookings();
    return bookings.filter((b) => {
      const uid = typeof b.userId === 'string' ? b.userId : b.userId?._id;
      return uid === userId;
    });
  },

  createBooking: (booking: Booking): Booking => {
    const bookings = mockStore.getBookings();
    bookings.unshift(booking);
    safeSetItem(BOOKINGS_KEY, bookings);

    // If seated, mark seats as taken in tickets store
    const eventId =
      typeof booking.eventId === 'string'
        ? booking.eventId
        : booking.eventId?._id;
    if (eventId && booking.seatNumbers && booking.seatNumbers.length > 0) {
      mockStore.markSeatsTaken(
        eventId,
        booking.zoneName,
        booking.seatNumbers
      );
    }

    // Deduct available seats in the event
    if (eventId) {
      const event = mockStore.getEventById(eventId);
      if (event) {
        const zone = event.zones.find((z) => z.name === booking.zoneName);
        if (zone) {
          zone.availableSeats = Math.max(0, (zone.availableSeats || 0) - booking.quantity);
          mockStore.updateEvent(eventId, { zones: event.zones });
        }
      }
    }

    return booking;
  },

  updateBookingStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled'): Booking | null => {
    const bookings = mockStore.getBookings();
    const idx = bookings.findIndex((b) => b._id === id);
    if (idx === -1) return null;
    bookings[idx].status = status;
    bookings[idx].updatedAt = new Date().toISOString();
    safeSetItem(BOOKINGS_KEY, bookings);
    return bookings[idx];
  },

  deleteBooking: (id: string): boolean => {
    const bookings = mockStore.getBookings().filter((b) => b._id !== id);
    safeSetItem(BOOKINGS_KEY, bookings);
    return true;
  },

  // ─── High Concurrency Queue Simulation ──────────────────────────────
  enqueue: (params: {
    userId: string;
    eventId: string;
    zoneName: string;
    quantity: number;
    seatNumbers?: string[];
  }): { trackingId: string; status: string } => {
    const trackingId = `trk_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    const event = mockStore.getEventById(params.eventId);
    const zone = event?.zones.find((z) => z.name === params.zoneName);
    const pricePerSeat = zone?.price || 0;
    const totalPrice = pricePerSeat * params.quantity;

    // Create a pending booking
    const bookingId = `bkg_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    const newBooking: Booking = {
      _id: bookingId,
      userId: params.userId,
      eventId: event
        ? {
            _id: event._id,
            title: event.title,
            date: event.date,
            location: event.location,
          }
        : params.eventId,
      zoneName: params.zoneName,
      quantity: params.quantity,
      seatNumbers: params.seatNumbers,
      status: 'pending',
      trackingId,
      price: pricePerSeat,
      totalPrice,
      createdAt: new Date().toISOString(),
      expiresAt,
      updatedAt: new Date().toISOString(),
      tickets: (params.seatNumbers || []).map((sn, idx) => ({
        _id: `tkt_${Date.now()}_${idx}`,
        eventId: params.eventId,
        seatNumber: sn,
        zoneName: params.zoneName,
        status: 'sold',
      })),
    };

    mockStore.createBooking(newBooking);

    // Save queue record
    const queues = safeGetItem<Record<string, QueueRecord>>(QUEUES_KEY, {});
    queues[trackingId] = {
      trackingId,
      bookingId,
      userId: params.userId,
      eventId: params.eventId,
      zoneName: params.zoneName,
      quantity: params.quantity,
      seatNumbers: params.seatNumbers,
      totalPrice,
      attempts: 0,
      status: 'waiting',
      createdAt: Date.now(),
    };
    safeSetItem(QUEUES_KEY, queues);

    return { trackingId, status: 'queued' };
  },

  pollQueue: (trackingId: string): { status: string; bookingId?: string; message?: string } => {
    const queues = safeGetItem<Record<string, QueueRecord>>(QUEUES_KEY, {});
    const record = queues[trackingId];

    if (!record) {
      // Check if there is an existing booking with this trackingId directly
      const bookings = mockStore.getBookings();
      const b = bookings.find((bk) => bk.trackingId === trackingId);
      if (b) {
        return { status: 'confirmed', bookingId: b._id };
      }
      return { status: 'failed', message: 'Queue tracking expired' };
    }

    record.attempts += 1;

    // 1st poll: Position #2
    // 2nd poll: Confirmed!
    if (record.attempts >= 2) {
      record.status = 'confirmed';
      safeSetItem(QUEUES_KEY, queues);
      return {
        status: 'confirmed',
        bookingId: record.bookingId,
        message: 'Your tickets are reserved! Please proceed to payment.',
      };
    } else {
      safeSetItem(QUEUES_KEY, queues);
      return {
        status: 'waiting',
        message: 'High traffic queue — Assigning your reservation (Position #1)',
      };
    }
  },
};
