import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Event } from '@/types';
import { Card, CardContent, CardFooter, Button } from '@/components/ui';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const minPrice = Math.min(...event.zones.map((z) => z.price));
    const maxPrice = Math.max(...event.zones.map((z) => z.price));
    const isSeated = event.type === 'seated';

    return (
        <Card className="flex flex-col overflow-hidden border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                        <Ticket className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isSeated ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {isSeated ? 'Seated' : 'Standing'}
                    </span>
                </div>
            </div>

            <CardContent className="flex-1 p-5">
                <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                </div>

                <div className="flex justify-between items-end border-t border-zinc-800/50 pt-4 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Starting from</span>
                        <span className="text-lg font-bold text-white">฿{minPrice.toLocaleString()}</span>
                    </div>
                    {event.zones.length > 1 && (
                        <div className="text-xs text-zinc-500 mb-1">
                            Up to ฿{maxPrice.toLocaleString()}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Link href={`/events/${event._id}`} className="w-full">
                    <Button className="w-full bg-white text-black hover:bg-indigo-500 hover:text-white transition-colors font-semibold">
                        Get Tickets
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
