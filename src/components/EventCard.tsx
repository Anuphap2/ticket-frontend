import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import { Event } from "@/types";
import { Card, CardContent, CardFooter, Button, Badge } from "@/components/ui";
import { useMemo } from "react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { minPrice, maxPrice, totalAvailable, totalSeats, percentLeft } =
    useMemo(() => {
      const minP = Math.min(...event.zones.map((z) => z.price));
      const maxP = Math.max(...event.zones.map((z) => z.price));

      const totalAvail = event.zones.reduce(
        (acc, z) => acc + (z.availableSeats || 0),
        0,
      );

      const totalS = event.zones.reduce(
        (acc, z) => acc + (z.totalSeats || 0),
        0,
      );

      const percent = totalS ? Math.round((totalAvail / totalS) * 100) : 0;

      return {
        minPrice: minP,
        maxPrice: maxP,
        totalAvailable: totalAvail,
        totalSeats: totalS,
        percentLeft: percent,
      };
    }, [event.zones]);

  const progressColor =
    totalAvailable === 0
      ? "bg-zinc-300"
      : percentLeft <= 20
        ? "bg-rose-500"
        : percentLeft <= 50
          ? "bg-amber-500"
          : "bg-emerald-500";

  return (
    <Card className="flex flex-col overflow-hidden bg-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group h-full rounded-2xl">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
        {event.imageUrl ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${event.imageUrl}`}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300">
            <Ticket className="h-12 w-12 opacity-50" />
          </div>
        )}

        <div className="absolute top-4 right-4">
          {totalAvailable === 0 ? (
            <Badge className="bg-rose-600 text-white border-none px-3 py-1 font-bold uppercase">
              Sold Out
            </Badge>
          ) : percentLeft <= 20 ? (
            <Badge className="bg-rose-500 text-white border-none px-3 py-1 font-bold uppercase animate-pulse">
              Almost Sold Out
            </Badge>
          ) : percentLeft <= 50 ? (
            <Badge className="bg-amber-500 text-white border-none px-3 py-1 font-bold uppercase">
              Filling Fast
            </Badge>
          ) : (
            <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-bold uppercase">
              Available
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="flex-1 p-5 flex flex-col">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-widest">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(event.date), "MMMM d, yyyy • h:mm a")}
        </div>

        <h3 className="text-lg font-extrabold mb-1 line-clamp-1 text-zinc-900 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        {/* 💰 ราคา */}
        <div className="text-sm font-bold text-zinc-900 mb-2">
          {minPrice === maxPrice
            ? `฿${minPrice.toLocaleString()}`
            : `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`}
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* 📊 Capacity */}
        <div className="mt-auto pt-4 border-t border-zinc-100">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Users size={12} /> Capacity
            </span>
            <span className="text-[10px] font-bold text-zinc-900">
              {totalAvailable} / {totalSeats} Left
            </span>
          </div>

          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${progressColor}`}
              style={{ width: `${percentLeft}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/events/${event._id}`} className="w-full">
          <Button
            disabled={totalAvailable === 0}
            className={`w-full font-bold text-xs uppercase tracking-widest rounded-xl h-12 transition-all ${
              totalAvailable === 0
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : percentLeft <= 20
                  ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
                  : "bg-zinc-900 text-white hover:bg-black shadow-lg"
            }`}
          >
            {totalAvailable === 0
              ? "Sold Out"
              : percentLeft <= 20
                ? "Book Now"
                : "Get Tickets"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
