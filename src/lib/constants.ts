// Central route constants — use these instead of hardcoded path strings.
export const ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
    myBookings: '/my-bookings',
    profile: '/profile',
    admin: '/admin',
    event: (id: string) => `/events/${id}`,
    bookingPayment: (id: string) => `/bookings/${id}/payment`,
    bookingSuccess: (id: string) => `/bookings/${id}/success`,
} as const;

// API endpoint path constants
export const API_PATHS = {
    auth: {
        signin: '/auth/signin',
        signup: '/auth/signup',
        profile: '/auth/profile',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
    },
    events: {
        base: '/events',
        byId: (id: string) => `/events/${id}`,
        tickets: (id: string) => `/tickets/event/${id}`,
    },
    bookings: {
        base: '/bookings',
        status: (trackingId: string) => `/bookings/status/${trackingId}`,
        myBookings: '/bookings/myBookings',
        allBookings: '/bookings/all-bookings',
        updateStatus: (id: string) => `/bookings/${id}/status`,
        delete: (id: string) => `/bookings/${id}`,
    },
    payments: {
        createIntent: '/payments/create-intent',
    },
    users: {
        base: '/users',
        byId: (id: string) => `/users/${id}`,
    },
} as const;
