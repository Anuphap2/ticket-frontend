import { mockStore } from './mockStore';
import { User } from '@/types';

export interface MockApiResponse {
  status: number;
  data: any;
}

// Extract current user ID from Authorization header or localStorage
const getCurrentUserId = (authHeader?: string): string => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?._id) return u._id;
      } catch {}
    }
  }

  if (authHeader && authHeader.startsWith('Bearer mock_jwt_access_')) {
    return authHeader.replace('Bearer mock_jwt_access_', '');
  }

  return 'usr_demo_user_01';
};

export const handleMockRequest = async (
  method: string,
  url: string,
  data?: any,
  headers?: any
): Promise<MockApiResponse | null> => {
  const normMethod = method.toUpperCase();
  // Strip baseURL or origin if present
  let cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
  const [pathname, search] = cleanUrl.split('?');
  const queryParams = new URLSearchParams(search || '');

  // Add realistic micro-delay so UI loading spinners work naturally
  await new Promise((resolve) => setTimeout(resolve, 120));

  // ─── AUTH ─────────────────────────────────────────────────────────────
  if (pathname === '/auth/signin' && normMethod === 'POST') {
    const { email, password } = data || {};
    let user = mockStore.getUserByEmail(email || '');

    // Allow demo logins or auto-create demo user
    if (!user) {
      if (email === 'admin@demo.com') {
        user = mockStore.getUserById('usr_demo_admin_01');
      } else {
        user = {
          _id: `usr_${Date.now()}`,
          email: email || 'user@demo.com',
          role: email?.includes('admin') ? 'admin' : 'user',
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '081-000-0000',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockStore.saveUser(user);
      }
    }

    const token = `mock_jwt_access_${user?._id || 'usr_demo_user_01'}`;
    const refreshToken = `mock_jwt_refresh_${user?._id || 'usr_demo_user_01'}`;

    return {
      status: 200,
      data: {
        success: true,
        data: {
          access_token: token,
          refresh_token: refreshToken,
          user,
        },
      },
    };
  }

  if (pathname === '/auth/signup' && normMethod === 'POST') {
    const { email, firstName, lastName, phoneNumber } = data || {};
    const newUser: User = {
      _id: `usr_${Date.now()}`,
      email: email || 'user@demo.com',
      role: 'user',
      firstName: firstName || 'Somchai',
      lastName: lastName || 'Prasert',
      phoneNumber: phoneNumber || '081-234-5678',
      phone: phoneNumber || '081-234-5678',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStore.saveUser(newUser);

    return {
      status: 201,
      data: {
        success: true,
        data: {
          access_token: `mock_jwt_access_${newUser._id}`,
          refresh_token: `mock_jwt_refresh_${newUser._id}`,
          user: newUser,
        },
      },
    };
  }

  if (pathname === '/auth/profile') {
    const userId = getCurrentUserId(headers?.Authorization);
    const user = mockStore.getUserById(userId) || mockStore.getUsers()[0];

    if (normMethod === 'GET') {
      return {
        status: 200,
        data: {
          success: true,
          data: user,
        },
      };
    }

    if (normMethod === 'PATCH') {
      const updated = mockStore.updateUser(userId, data || {});
      return {
        status: 200,
        data: {
          success: true,
          data: updated,
        },
      };
    }
  }

  if (pathname === '/auth/refresh') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          access_token: `mock_jwt_access_${getCurrentUserId(headers?.Authorization)}`,
          refresh_token: 'mock_jwt_refresh_token',
        },
      },
    };
  }

  if (pathname === '/auth/logout') {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Logged out successfully',
      },
    };
  }

  // ─── EVENTS ───────────────────────────────────────────────────────────
  if (pathname === '/events') {
    if (normMethod === 'GET') {
      return {
        status: 200,
        data: {
          success: true,
          data: mockStore.getEvents(),
        },
      };
    }

    if (normMethod === 'POST') {
      const newEvent = mockStore.createEvent(data);
      return {
        status: 201,
        data: {
          success: true,
          data: newEvent,
        },
      };
    }
  }

  // Upload event image
  if (pathname === '/events/upload' && normMethod === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
        },
      },
    };
  }

  // Single event `/events/:id`
  const eventMatch = pathname.match(/^\/events\/([^\/]+)$/);
  if (eventMatch) {
    const eventId = eventMatch[1];
    if (normMethod === 'GET') {
      const event = mockStore.getEventById(eventId);
      if (!event) {
        return { status: 404, data: { message: 'Event not found' } };
      }
      return {
        status: 200,
        data: {
          success: true,
          data: event,
        },
      };
    }

    if (normMethod === 'PATCH') {
      const updated = mockStore.updateEvent(eventId, data || {});
      return {
        status: 200,
        data: {
          success: true,
          data: updated,
        },
      };
    }

    if (normMethod === 'DELETE') {
      mockStore.deleteEvent(eventId);
      return {
        status: 200,
        data: {
          success: true,
          message: 'Event deleted',
        },
      };
    }
  }

  // ─── TICKETS ──────────────────────────────────────────────────────────
  const ticketsMatch = pathname.match(/^\/tickets\/event\/([^\/]+)$/);
  if (ticketsMatch && normMethod === 'GET') {
    const eventId = ticketsMatch[1];
    const tickets = mockStore.getTicketsByEvent(eventId);
    return {
      status: 200,
      data: {
        success: true,
        data: tickets,
      },
    };
  }

  // ─── BOOKINGS ─────────────────────────────────────────────────────────
  if (pathname === '/bookings' && normMethod === 'POST') {
    const userId = getCurrentUserId(headers?.Authorization);
    const result = mockStore.enqueue({
      userId,
      eventId: data.eventId,
      zoneName: data.zoneName,
      quantity: data.quantity,
      seatNumbers: data.seatNumbers,
    });

    return {
      status: 201,
      data: {
        success: true,
        data: result,
      },
    };
  }

  // Poll status `/bookings/status/:trackingId`
  const statusMatch = pathname.match(/^\/bookings\/status\/([^\/]+)$/);
  if (statusMatch && normMethod === 'GET') {
    const trackingId = statusMatch[1];
    const result = mockStore.pollQueue(trackingId);
    return {
      status: 200,
      data: {
        success: true,
        data: result,
      },
    };
  }

  // My bookings
  if (pathname === '/bookings/myBookings' && normMethod === 'GET') {
    const userId = getCurrentUserId(headers?.Authorization);
    const bookings = mockStore.getUserBookings(userId);
    return {
      status: 200,
      data: {
        success: true,
        data: bookings,
      },
    };
  }

  // All bookings for admin
  if (pathname === '/bookings/all-bookings' && normMethod === 'GET') {
    const bookings = mockStore.getBookings();
    const page = Number(queryParams.get('page')) || 1;
    const limit = Number(queryParams.get('limit')) || 20;
    const start = (page - 1) * limit;
    const slice = bookings.slice(start, start + limit);

    return {
      status: 200,
      data: {
        success: true,
        data: slice,
        meta: {
          total: bookings.length,
          page,
          limit,
        },
      },
    };
  }

  // Confirm booking `/bookings/:id/confirm`
  const confirmMatch = pathname.match(/^\/bookings\/([^\/]+)\/confirm$/);
  if (confirmMatch && normMethod === 'PATCH') {
    const bookingId = confirmMatch[1];
    const updated = mockStore.updateBookingStatus(bookingId, 'confirmed');
    return {
      status: 200,
      data: {
        success: true,
        data: updated,
      },
    };
  }

  // Update booking status `/bookings/:id/status`
  const bookingStatusMatch = pathname.match(/^\/bookings\/([^\/]+)\/status$/);
  if (bookingStatusMatch && normMethod === 'PATCH') {
    const bookingId = bookingStatusMatch[1];
    const updated = mockStore.updateBookingStatus(bookingId, data.status);
    return {
      status: 200,
      data: {
        success: true,
        data: updated,
      },
    };
  }

  // Delete booking `/bookings/:id`
  const deleteBookingMatch = pathname.match(/^\/bookings\/([^\/]+)$/);
  if (deleteBookingMatch && normMethod === 'DELETE') {
    const bookingId = deleteBookingMatch[1];
    mockStore.deleteBooking(bookingId);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Booking deleted',
      },
    };
  }

  // ─── PAYMENTS ─────────────────────────────────────────────────────────
  if (pathname === '/payments/create-intent' && normMethod === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          clientSecret: `demo_pi_secret_${Date.now()}_test`,
        },
      },
    };
  }

  // ─── USERS (Admin) ────────────────────────────────────────────────────
  if (pathname === '/users' && normMethod === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        data: mockStore.getUsers(),
      },
    };
  }

  const userMatch = pathname.match(/^\/users\/([^\/]+)$/);
  if (userMatch) {
    const userId = userMatch[1];
    if (normMethod === 'GET') {
      const u = mockStore.getUserById(userId);
      return {
        status: 200,
        data: {
          success: true,
          data: u,
        },
      };
    }
    if (normMethod === 'PATCH') {
      const updated = mockStore.updateUser(userId, data || {});
      return {
        status: 200,
        data: {
          success: true,
          data: updated,
        },
      };
    }
    if (normMethod === 'DELETE') {
      mockStore.deleteUser(userId);
      return {
        status: 200,
        data: {
          success: true,
          message: 'User deleted',
        },
      };
    }
  }

  // Not handled by mock API
  return null;
};
