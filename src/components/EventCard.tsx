import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket, Users } from "lucide-react"; // เพิ่ม Users icon
import { Event } from "@/types";
import { Card, CardContent, CardFooter, Button, Badge } from "@/components/ui";
import { useMemo } from "react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // 🎯 คำนวณราคาและจำนวนตั๋วที่เหลือ
  const { minPrice, maxPrice, totalAvailable, totalSeats } = useMemo(() => {
    const minP = Math.min(...event.zones.map((z) => z.price));
    const maxP = Math.max(...event.zones.map((z) => z.price));
    const totalAvail = event.zones.reduce(
      (acc, z) => acc + (z.availableSeats || 0),
      0,
    );
    const totalS = event.zones.reduce((acc, z) => acc + (z.totalSeats || 0), 0);

    return {
      minPrice: minP,
      maxPrice: maxP,
      totalAvailable: totalAvail,
      totalSeats: totalS,
    };
  }, [event.zones]);

  const isLowStock = totalAvailable > 0 && totalAvailable <= 20; // ⚠️ แจ้งเตือนถ้าเหลือน้อยกว่า 20 ใบ

  return (
    <Card className="flex flex-col overflow-hidden border-zinc-200 bg-white text-zinc-900 hover:shadow-lg transition-all duration-300 group h-full rounded-[2rem]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300">
            <Ticket className="h-12 w-12 opacity-50" />
          </div>
        )}

        {/* 🎯 Badge แสดงสถานะตั๋วที่เหลือมุมบน */}
        <div className="absolute top-4 right-4">
          {totalAvailable === 0 ? (
            <Badge className="bg-rose-500 text-white border-none px-3 py-1 font-black italic uppercase">
              Sold Out
            </Badge>
          ) : isLowStock ? (
            <Badge className="bg-amber-500 text-white border-none px-3 py-1 font-black italic uppercase animate-pulse">
              Low Stock: {totalAvailable}
            </Badge>
          ) : (
            <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black italic uppercase">
              {totalAvailable} Available
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="flex-1 p-5 flex flex-col">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-3 uppercase tracking-widest">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(event.date), "MMMM d, yyyy • h:mm a")}
        </div>

        <h3 className="text-xl font-black mb-2 line-clamp-1 text-zinc-900 group-hover:text-indigo-600 transition-colors italic uppercase tracking-tighter">
          {event.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* 🎯 Progress Bar แสดงสัดส่วนที่นั่งที่เหลือ */}
        <div className="mt-auto pt-4 border-t border-zinc-50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Users size={12} /> Capacity Status
            </span>
            <span className="text-[10px] font-black text-zinc-900">
              {totalAvailable} / {totalSeats} Left
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${totalAvailable === 0 ? "bg-zinc-300" : "bg-indigo-600"}`}
              style={{ width: `${(totalAvailable / totalSeats) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link href={`/events/${event._id}`} className="w-full">
          <Button
            disabled={totalAvailable === 0}
            className={`w-full font-black text-xs uppercase tracking-[0.2em] rounded-xl h-12 transition-all ${
              totalAvailable === 0
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 text-white hover:bg-black shadow-xl shadow-zinc-200"
            }`}
          >
            {totalAvailable === 0 ? "Sold Out" : "Get Tickets"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
