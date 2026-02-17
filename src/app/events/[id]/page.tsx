"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Event, Ticket } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  Info,
  Users,
  Armchair,
  Loader2,
  Timer,
} from "lucide-react";
import { SeatMap } from "@/components/SeatMap";
import { Navbar } from "@/components/Navbar";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // 1. ดึงข้อมูลครั้งแรก
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, ticketsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/tickets/event/${id}`),
        ]);

        const eventData = eventRes.data?.data || eventRes.data;
        const ticketsData = ticketsRes.data?.data || ticketsRes.data;

        setEvent(eventData);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);

        if (eventData?.zones?.length > 0) {
          setSelectedZone(eventData.zones[0].name);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // 2. คำนวณที่นั่งที่ไม่ว่าง (ใช้ useMemo เพื่อ Performance)
  const takenSeats = useMemo(() => {
    return tickets
      .filter((t) => t.zoneName === selectedZone && t.status !== "available")
      .map((t) => t.seatNumber);
  }, [tickets, selectedZone]);

  // 3. 🎯 ระบบ Auto-Cleanup: ถ้าที่นั่งที่เลือกอยู่ถูกคนอื่นจองไปแล้ว ให้ลบทิ้งทันที
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(async () => {
      try {
        const ticketsRes = await api.get(`/tickets/event/${id}`);
        const ticketsData = ticketsRes.data?.data || ticketsRes.data;
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } catch (error) {
        console.error("Polling Tickets Error:", error);
      }
    }, 5000); // 5 วินาทีเช็คทีนึง

    return () => clearInterval(interval); // ล้าง interval เมื่อออกจากหน้า
  }, [id]);

  const selectedZoneDetails = event?.zones.find((z) => z.name === selectedZone);
  const isSeated = selectedZoneDetails?.type === "seated";

  // 4. 🎯 ป้องกันการคลิกที่นั่งที่ไม่ว่าง
  const handleSeatClick = (seatNo: string) => {
    if (takenSeats.includes(seatNo)) {
      toast.error("ที่นั่งนี้ถูกจองแล้ว");
      return;
    }

    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("จองได้สูงสุด 6 ที่นั่งต่อครั้ง");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      router.push("/login");
      return;
    }

    // 🎯 ตรวจสอบความถูกต้องก่อนส่ง API (Double Check)
    if (isSeated && selectedSeats.some((s) => takenSeats.includes(s))) {
      toast.error("ขออภัย มีบางที่นั่งไม่ว่างแล้ว กรุณาเลือกใหม่");
      return;
    }

    setIsBooking(true);

    const formattedSeats = isSeated
      ? selectedSeats.map((seatLabel) => {
          const seatNumber = seatLabel.replace(/\D/g, "");
          return `${selectedZone}${seatNumber}`;
        })
      : undefined;

    const bookingQuantity = isSeated ? selectedSeats.length : quantity;

    try {
      const response = await bookingService.create({
        eventId: id as string,
        zoneName: selectedZone,
        quantity: bookingQuantity,
        seatNumbers: formattedSeats,
      });

      const res = response.data?.data || response.data || response;

      // กรณีจองได้ทันที (ไม่มีคิว)
      if (res._id || res.id) {
        toast.success("จองที่นั่งสำเร็จ!");
        router.push(`/bookings/${res._id || res.id}/payment`);
        return;
      }

      // กรณีเข้าคิว
      if (res.trackingId) {
        toast.loading("ระบบกำลังจัดลำดับคิวให้คุณ...", { id: "queue-status" });
        const checkQueue = setInterval(async () => {
          try {
            const response = await bookingService.checkStatus(res.trackingId);
            const statusData =
              response?.data?.data || response?.data || response;

            if (statusData?.status === "confirmed") {
              const bId =
                statusData.bookingId || statusData._id || statusData.id;
              clearInterval(checkQueue);
              toast.success("ถึงคิวของคุณแล้ว!", { id: "queue-status" });
              router.push(`/bookings/${bId}/payment`);
            } else if (statusData?.status === "failed") {
              clearInterval(checkQueue);
              setIsBooking(false);
              toast.error(statusData.message || "การจองล้มเหลว", {
                id: "queue-status",
              });
            }
          } catch (e) {
            console.error(e);
          }
        }, 2000);
      }
    } catch (error: any) {
      setIsBooking(false);
      // Refresh ตั๋วใหม่ถ้าพลาด
      const ticketsRes = await api.get(`/tickets/event/${id}`);
      setTickets(ticketsRes.data?.data || ticketsRes.data || []);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );

  const totalPrice =
    (selectedZoneDetails?.price || 0) *
    (isSeated ? selectedSeats.length : quantity);

  // 🎯 ตรวจสอบว่าที่นั่งที่เลือก "หลุด" ไปหรือยัง
  const hasInvalidSeat = selectedSeats.some((s) => takenSeats.includes(s));

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />
      {/* Banner Section */}
      <div className="relative h-[40vh] w-full bg-black">
        {event?.imageUrl && (
          <Image
            src={event.imageUrl}
            alt="banner"
            fill
            className="object-cover opacity-50 blur-[2px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent" />
        <div className="absolute bottom-8 left-0 w-full px-6 md:px-20">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter italic uppercase">
            {event?.title}
          </h1>
          <div className="flex gap-4 mt-4">
            <Badge className="bg-indigo-600 px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />{" "}
              {event && format(new Date(event.date), "dd MMM yyyy")}
            </Badge>
            <Badge className="bg-zinc-800 px-3 py-1">
              <MapPin className="w-3 h-3 mr-1" /> {event?.location}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-6 relative z-10">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[32px] overflow-hidden border-none shadow-xl bg-white">
            <CardHeader className="bg-zinc-50 border-b flex flex-row items-center justify-between p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Armchair className="text-indigo-600" /> ผังที่นั่ง :{" "}
                {selectedZone}
              </CardTitle>
              <div className="flex bg-zinc-200 p-1 rounded-xl">
                {event?.zones.map((z) => (
                  <button
                    key={z.name}
                    onClick={() => {
                      setSelectedZone(z.name);
                      setSelectedSeats([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedZone === z.name ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500"}`}
                  >
                    {z.name}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-zinc-950">
              {isSeated ? (
                <div className="p-8">
                  <div className="flex justify-center gap-4 mb-6 text-[10px] text-zinc-500 font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-zinc-800 rounded-sm" /> ว่าง
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-indigo-500 rounded-sm" /> เลือก
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-zinc-700 opacity-40 rounded-sm" />{" "}
                      จองแล้ว
                    </span>
                  </div>
                  <div className="flex justify-center overflow-x-auto">
                    <SeatMap
                      rows={selectedZoneDetails?.rows || 0}
                      seatsPerRow={selectedZoneDetails?.seatsPerRow || 0}
                      takenSeats={takenSeats}
                      selectedSeats={selectedSeats}
                      onSeatClick={handleSeatClick}
                      selectedZone={selectedZone}
                      price={selectedZoneDetails?.price || 0}
                    />
                  </div>
                  <div className="mt-8 py-2 bg-zinc-900 text-center text-[10px] text-zinc-600 tracking-[1.5em] font-black rounded-lg">
                    STAGE
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <Users className="w-16 h-16 text-indigo-500/30 mx-auto mb-4" />
                  <h2 className="text-white text-2xl font-black italic">
                    Standing Area
                  </h2>
                  <p className="text-zinc-500 text-sm">
                    เลือกจำนวนบัตรที่ต้องการทางด้านขวา
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-[32px] p-8 border-none shadow-md">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
              <Info className="text-indigo-600" /> รายละเอียดกิจกรรม
            </h3>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line">
              {event?.description}
            </p>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden sticky top-24">
            <div className="bg-zinc-900 p-8 text-white">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Summary
              </span>
              <h2 className="text-3xl font-black italic">{selectedZone}</h2>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-zinc-400 text-xs font-bold uppercase">
                  ราคา
                </span>
                <span className="text-2xl font-black text-indigo-600 font-mono">
                  ฿{selectedZoneDetails?.price.toLocaleString()}
                </span>
              </div>
              {!isSeated ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    จำนวนบัตร
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="h-12 rounded-xl font-bold"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    ที่นั่งที่เลือก ({selectedSeats.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((s) => (
                      <Badge
                        key={s}
                        className="bg-indigo-50 text-indigo-600 border-none font-mono font-bold"
                      >
                        {s}
                      </Badge>
                    ))}
                    {selectedSeats.length === 0 && (
                      <span className="text-zinc-400 text-xs italic">
                        กรุณาเลือกบนผัง
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    รวมราคาสุทธิ
                  </span>
                  <span className="text-4xl font-black text-zinc-900 font-mono tracking-tighter">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={handleBooking}
                  disabled={
                    isBooking ||
                    (isSeated && (selectedSeats.length === 0 || hasInvalidSeat))
                  }
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-transform active:scale-95 disabled:bg-zinc-300 disabled:shadow-none"
                >
                  {isBooking ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <TicketIcon className="mr-2 h-5 w-5" />
                  )}
                  {isBooking
                    ? "กำลังจัดลำดับคิว..."
                    : hasInvalidSeat
                      ? "ที่นั่งถูกจองแล้ว"
                      : "ยืนยันการจอง"}
                </Button>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                <Timer className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">
                  ล็อคที่นั่งให้ 15 นาทีหลังจากจองสำเร็จ กรุณาชำระเงินตามเวลา
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
