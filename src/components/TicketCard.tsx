import React from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { Booking } from '@/types';
import { Calendar, MapPin, Clock, Armchair, Copy } from 'lucide-react';
import { Card } from '@/components/ui';
import toast from 'react-hot-toast';

interface TicketCardProps {
    booking: Booking;
}

export const TicketCard: React.FC<TicketCardProps> = ({ booking }) => {
    // Safely access nested event data
    const event = booking.eventId && typeof booking.eventId === 'object' ? (booking.eventId as any) : null;

    if (!event) return null;

    const formattedDate = format(new Date(event.date), 'EEE, d MMM yyyy');
    const formattedTime = format(new Date(event.date), 'h:mm a');

    const handleCopyId = () => {
        navigator.clipboard.writeText(booking._id);
        toast.success('Booking ID copied!');
    };

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-zinc-100 group relative">
            {/* Top Section: Event Image & Basic Info */}
            <div className="relative h-48">
                <div className="absolute inset-0 bg-zinc-900/10 z-10" />
                <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{event.title}</h3>
                    <div className="flex items-center text-zinc-300 text-xs mt-1 space-x-3">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {formattedDate}</span>
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {event.location}</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-20 shadow-sm
                    ${booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                        booking.status === 'cancelled' ? 'bg-red-500 text-white' :
                            'bg-yellow-500 text-white'}`}>
                    {booking.status}
                </div>
            </div>

            {/* Middle Section: Ticket Details (Rip-off effect) */}
            <div className="relative bg-white p-5 pt-6">
                {/* Semi-circles for ticket effect */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-zinc-50 rounded-full z-30"></div>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-zinc-50 rounded-full z-30"></div>
                <div className="absolute top-0 left-3 right-3 border-t-2 border-dashed border-zinc-200"></div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Zone</p>
                        <p className="font-bold text-indigo-600 text-lg">{booking.zoneName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Seats</p>
                        <p className="font-bold text-zinc-800 text-sm">
                            {booking.seatNumbers && booking.seatNumbers.length > 0
                                ? booking.seatNumbers.join(', ')
                                : `${booking.quantity} General`}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                    <div>
                        <p className="text-[10px] text-zinc-400 uppercase mb-0.5">Booking ID</p>
                        <div className="flex items-center space-x-1 cursor-pointer hover:text-indigo-600 transition-colors" onClick={handleCopyId}>
                            <p className="text-xs font-mono font-medium text-zinc-600 truncate max-w-[100px]">{booking._id}</p>
                            <Copy className="w-3 h-3 text-zinc-400" />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-400 uppercase mb-0.5">Total Price</p>
                        <p className="text-sm font-bold text-zinc-900">${booking.totalPrice}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: QR Code */}
            <div className="pb-6 pt-2 flex flex-col items-center justify-center">
                <div className="bg-white p-2 rounded-lg border border-zinc-100 shadow-sm">
                    <QRCode
                        value={JSON.stringify({ bookingId: booking._id, event: event.title, seats: booking.seatNumbers })}
                        size={100}
                        level="M"
                        fgColor="#18181b"
                    />
                </div>
                <p className="text-[10px] text-zinc-400 mt-2">Scan at entrance</p>
            </div>
        </div>
    );
};
