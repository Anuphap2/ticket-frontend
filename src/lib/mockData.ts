import { User, Event, Booking, Ticket } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    _id: 'usr_demo_user_01',
    email: 'user@demo.com',
    role: 'user',
    firstName: 'Somchai',
    lastName: 'Prasert',
    phoneNumber: '081-234-5678',
    phone: '081-234-5678',
    nationalId: '1100500123456',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    _id: 'usr_demo_admin_01',
    email: 'admin@demo.com',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    phoneNumber: '089-876-5432',
    phone: '089-876-5432',
    nationalId: '1100500999999',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    _id: 'usr_demo_user_02',
    email: 'chayanon.t@gmail.com',
    role: 'user',
    firstName: 'Chayanon',
    lastName: 'Thanasit',
    phoneNumber: '082-991-8822',
    phone: '082-991-8822',
    nationalId: '1100500777112',
    createdAt: '2026-11-02T14:20:00.000Z',
    updatedAt: '2026-11-02T14:20:00.000Z',
  },
];

export const INITIAL_EVENTS: Event[] = [
  {
    _id: 'evt_coldplay_bkk',
    title: 'COLDPLAY: Music of the Spheres World Tour Bangkok',
    description:
      'Experience the groundbreaking, eco-friendly stadium spectacle by Coldplay featuring kinetic dance floors, LED wristbands, and legendary anthems including Yellow, Fix You, and Viva La Vida.',
    date: '2027-02-14T19:00:00.000Z',
    location: 'Rajamangala National Stadium, Bangkok',
    status: 'active',
    imageUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    zones: [
      {
        name: 'VIP Seated',
        price: 7500,
        totalSeats: 40,
        availableSeats: 34,
        type: 'seated',
        rows: 4,
        seatsPerRow: 10,
      },
      {
        name: 'Standing A (Front Stage)',
        price: 5500,
        totalSeats: 250,
        availableSeats: 182,
        type: 'standing',
      },
      {
        name: 'Standard Seated',
        price: 3500,
        totalSeats: 60,
        availableSeats: 52,
        type: 'seated',
        rows: 6,
        seatsPerRow: 10,
      },
    ],
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-11-01T09:00:00.000Z',
  },
  {
    _id: 'evt_blackpink_bkk',
    title: 'BLACKPINK: Born Pink World Tour En-Core',
    description:
      'The global powerhouse girl group returns to Bangkok for their grand encore performance with high-energy choreography, pyrotechnics, and global hits like How You Like That and Pink Venom.',
    date: '2027-03-20T18:30:00.000Z',
    location: 'Impact Arena, Muang Thong Thani',
    status: 'active',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    zones: [
      {
        name: 'Blink VIP Seated',
        price: 8500,
        totalSeats: 40,
        availableSeats: 28,
        type: 'seated',
        rows: 4,
        seatsPerRow: 10,
      },
      {
        name: 'Standing Pit',
        price: 6000,
        totalSeats: 200,
        availableSeats: 124,
        type: 'standing',
      },
      {
        name: 'General Seated',
        price: 4000,
        totalSeats: 50,
        availableSeats: 41,
        type: 'seated',
        rows: 5,
        seatsPerRow: 10,
      },
    ],
    createdAt: '2026-10-20T11:00:00.000Z',
    updatedAt: '2026-11-02T13:00:00.000Z',
  },
  {
    _id: 'evt_edsheeran_bkk',
    title: 'Ed Sheeran: +–=÷× (The Mathematics) Tour',
    description:
      'Featuring an iconic 360-degree rotating stadium stage, loop pedal live creation, and heartfelt sing-alongs spanning all math albums from Shape of You to Perfect.',
    date: '2027-04-10T19:30:00.000Z',
    location: 'National Stadium (Supachalasai), Bangkok',
    status: 'active',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    zones: [
      {
        name: 'Mathematics Seated',
        price: 6500,
        totalSeats: 30,
        availableSeats: 24,
        type: 'seated',
        rows: 3,
        seatsPerRow: 10,
      },
      {
        name: 'Pitch Standing',
        price: 4500,
        totalSeats: 150,
        availableSeats: 98,
        type: 'standing',
      },
    ],
    createdAt: '2026-10-25T15:00:00.000Z',
    updatedAt: '2026-11-03T16:00:00.000Z',
  },
  {
    _id: 'evt_bodyslam_live',
    title: 'Bodyslam: Live Stadium Non-Stop Fest',
    description:
      'Thailand’s definitive rock phenomenon in a massive stadium setup with symphony orchestra brass, thunderous drums, and unforgettable crowd anthems.',
    date: '2027-05-01T18:00:00.000Z',
    location: 'Thunderdome Stadium, Nonthaburi',
    status: 'active',
    imageUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80',
    zones: [
      {
        name: 'Rock Zone Standing',
        price: 2500,
        totalSeats: 300,
        availableSeats: 215,
        type: 'standing',
      },
      {
        name: 'Grandstand Seated',
        price: 3200,
        totalSeats: 50,
        availableSeats: 39,
        type: 'seated',
        rows: 5,
        seatsPerRow: 10,
      },
    ],
    createdAt: '2026-10-28T09:30:00.000Z',
    updatedAt: '2026-11-04T10:15:00.000Z',
  },
];

// Helper to pre-populate tickets for seated zones
export const generateInitialTickets = (events: Event[]): Ticket[] => {
  const tickets: Ticket[] = [];

  events.forEach((event) => {
    event.zones.forEach((zone) => {
      if (zone.type === 'seated') {
        const total = zone.totalSeats || 0;
        // Mark some seats as sold or reserved to show real taken seats
        const takenIndices = new Set([3, 4, 7, 8, 15, 16]);

        for (let i = 1; i <= total; i++) {
          const seatNumber = `${zone.name}${i}`;
          const isTaken = takenIndices.has(i);
          tickets.push({
            _id: `tkt_${event._id}_${zone.name}_${i}`,
            eventId: event._id,
            seatNumber,
            zoneName: zone.name,
            status: isTaken ? 'sold' : 'available',
            createdAt: event.createdAt,
            updatedAt: event.updatedAt,
          });
        }
      }
    });
  });

  return tickets;
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    _id: 'bkg_demo_sample_01',
    userId: 'usr_demo_user_01',
    eventId: {
      _id: 'evt_coldplay_bkk',
      title: 'COLDPLAY: Music of the Spheres World Tour Bangkok',
      date: '2027-02-14T19:00:00.000Z',
      location: 'Rajamangala National Stadium, Bangkok',
    },
    zoneName: 'VIP Seated',
    quantity: 2,
    seatNumbers: ['VIP Seated1', 'VIP Seated2'],
    status: 'confirmed',
    trackingId: 'trk_sample_88921',
    totalPrice: 15000,
    price: 7500,
    createdAt: '2026-11-05T12:00:00.000Z',
    expiresAt: '2026-11-05T12:15:00.000Z',
    updatedAt: '2026-11-05T12:05:00.000Z',
    tickets: [
      {
        _id: 'tkt_demo_01',
        eventId: 'evt_coldplay_bkk',
        seatNumber: 'VIP Seated1',
        zoneName: 'VIP Seated',
        status: 'sold',
      },
      {
        _id: 'tkt_demo_02',
        eventId: 'evt_coldplay_bkk',
        seatNumber: 'VIP Seated2',
        zoneName: 'VIP Seated',
        status: 'sold',
      },
    ],
  },
  {
    _id: 'bkg_demo_sample_02',
    userId: 'usr_demo_user_02',
    eventId: {
      _id: 'evt_blackpink_bkk',
      title: 'BLACKPINK: Born Pink World Tour En-Core',
      date: '2027-03-20T18:30:00.000Z',
      location: 'Impact Arena, Muang Thong Thani',
    },
    zoneName: 'Standing Pit',
    quantity: 1,
    status: 'confirmed',
    trackingId: 'trk_sample_99412',
    totalPrice: 6000,
    price: 6000,
    createdAt: '2026-11-06T09:30:00.000Z',
    expiresAt: '2026-11-06T09:45:00.000Z',
    updatedAt: '2026-11-06T09:35:00.000Z',
  },
];
