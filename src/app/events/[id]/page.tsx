"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Event } from "@/types";
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
  Ticket,
  Info,
  Users,
  Armchair,
  Loader2,
} from "lucide-react";
import { SeatMap } from "@/components/SeatMap";
import { Navbar } from "@/components/Navbar";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
        if (response.data.zones.length > 0) {
          setSelectedZone(response.data.zones[0].name);
        }
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  // 🎯 กรองข้อมูลโซนและที่นั่งปัจจุบัน
  const selectedZoneDetails = event?.zones.find((z) => z.name === selectedZone);
  const isSeated = selectedZoneDetails?.type === "seated"; // เช็ค type จากระดับโซนตามที่เราแก้ DTO ไว้

  // 🎯 กรองที่นั่งเฉพาะโซนที่เลือก เพื่อส่งไปให้ SeatMap วาด
  const currentZoneSeats =
    event?.seats?.filter((s) => s.zoneName === selectedZone) || [];
  const takenSeats = currentZoneSeats
    .filter((s) => !s.isAvailable)
    .map((s) => s.seatNo);

  const handleSeatClick = (seatNo: string) => {
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("จำกัดการจองสูงสุด 6 ที่นั่งต่อครั้ง");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อจองตั๋ว");
      router.push("/login");
      return;
    }

    if (!event) return;
    if (isSeated && selectedSeats.length === 0) {
      toast.error("กรุณาเลือกที่นั่งอย่างน้อย 1 ที่");
      return;
    }

    setIsBooking(true);
    try {
      const bookingQuantity = isSeated
        ? selectedSeats.length
        : Number(quantity);
      const response = await bookingService.create({
        eventId: id as string,
        zoneName: selectedZone,
        quantity: bookingQuantity,
        seatNumbers: isSeated ? selectedSeats : undefined,
      });

      const res = (response as any).data || response;

      if (res.status === "confirmed" || res._id) {
        router.push(`/bookings/${res._id || res.id}/payment`);
        return;
      }

      if (res.trackingId) {
        toast.loading("กำลังเข้าคิวจอง... กรุณารอสักครู่", { id: "booking" });
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await bookingService.checkStatus(
              res.trackingId,
            );
            const statusData = (statusResponse as any).data || statusResponse;

            if (statusData.status === "confirmed" || statusData._id) {
              clearInterval(pollInterval);
              toast.success("จองที่นั่งสำเร็จ!", { id: "booking" });
              router.push(
                `/bookings/${statusData._id || statusData.id}/payment`,
              );
            } else if (statusData.status === "failed") {
              clearInterval(pollInterval);
              setIsBooking(false);
              toast.error("ขออภัย ที่นั่งนี้ถูกจองไปแล้วหรือเซสชันหมดอายุ", {
                id: "booking",
              });
            }
          } catch (e) {
            clearInterval(pollInterval);
            setIsBooking(false);
          }
        }, 2000);
      }
    } catch (error: any) {
      setIsBooking(false);
      toast.error(error.response?.data?.message || "การจองล้มเหลว", {
        id: "booking",
      });
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );

  if (!event) return <div className="text-center py-20">ไม่พบกิจกรรม</div>;

  const totalPrice =
    (selectedZoneDetails?.price || 0) *
    (isSeated ? selectedSeats.length : quantity);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-[50vh] w-full bg-zinc-950 overflow-hidden">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover opacity-50 blur-[1px] scale-105"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="mx-auto max-w-7xl space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white px-4 py-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {format(new Date(event.date), "PPP p")}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white px-4 py-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {event.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 -mt-10 relative z-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Zone & Seat Map Selection */}
            <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/50">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Armchair className="text-indigo-600" />{" "}
                    {isSeated ? "SELECT YOUR SEATS" : "GENERAL ADMISSION"}
                  </CardTitle>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    Stage is at the top of map
                  </p>
                </div>

                {/* 🎯 Zone Switcher (Modern Design) */}
                <div className="flex p-1.5 bg-zinc-200/50 rounded-2xl overflow-x-auto min-w-max">
                  {event.zones.map((zone) => (
                    <button
                      key={zone.name}
                      onClick={() => {
                        setSelectedZone(zone.name);
                        setSelectedSeats([]);
                      }}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                        selectedZone === zone.name
                          ? "bg-white text-indigo-600 shadow-xl scale-105"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {zone.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0 bg-zinc-950">
                {isSeated ? (
                  <div className="p-10 space-y-10">
                    {/* Legend */}
                    <div className="flex justify-center gap-8 py-4 border-b border-zinc-900">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-bold text-zinc-500">
                          AVAILABLE
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <span className="text-[10px] font-bold text-indigo-400">
                          SELECTED
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-400 opacity-20" />
                        <span className="text-[10px] font-bold text-zinc-700">
                          SOLD OUT
                        </span>
                      </div>
                    </div>

                    {/* 🎯 Interactive Seat Map */}
                    <div className="flex justify-center py-10 overflow-x-auto">
                      <SeatMap
                        rows={selectedZoneDetails?.rows || 0}
                        seatsPerRow={selectedZoneDetails?.seatsPerRow || 0}
                        takenSeats={takenSeats}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                        price={selectedZoneDetails?.price || 0}
                      />
                    </div>
                    <div className="w-full py-3 bg-zinc-900 rounded-b-3xl text-center text-[10px] font-black text-zinc-700 tracking-[1.5em] border-t border-zinc-800">
                      STAGE
                    </div>
                  </div>
                ) : (
                  <div className="p-24 text-center space-y-6 animate-in fade-in zoom-in-95">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Users className="h-12 w-12 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        Standing Zone
                      </h3>
                      <p className="text-zinc-500 mt-2 font-medium">
                        Enjoy the show from the standing area. First come, first
                        served.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[30px] overflow-hidden bg-white">
              <CardHeader className="bg-zinc-50 p-8 border-b border-zinc-100">
                <CardTitle className="text-lg font-black italic flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-500" /> EVENT DESCRIPTION
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-lg">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 🎯 Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                <CardHeader className="bg-zinc-900 p-8">
                  <CardTitle className="text-white/40 text-[10px] font-black tracking-widest uppercase italic">
                    Your Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex justify-between items-end border-b border-zinc-50 pb-6">
                    <div>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                        Zone
                      </p>
                      <h4 className="text-3xl font-black text-zinc-900 italic uppercase tracking-tighter">
                        {selectedZone}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                        Price/Seat
                      </p>
                      <p className="text-2xl font-black text-indigo-600 font-mono italic">
                        ฿{selectedZoneDetails?.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {isSeated ? (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                        Selected Seats <span>{selectedSeats.length}/6</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.length > 0 ? (
                          selectedSeats.map((seat) => (
                            <Badge
                              key={seat}
                              className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg font-mono font-black text-sm shadow-lg shadow-indigo-200"
                            >
                              {seat}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-zinc-400 text-sm italic py-4">
                            Click on the map to pick your spot
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest italic">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 font-black text-lg focus:bg-white transition-all"
                      />
                    </div>
                  )}

                  <div className="pt-8 -mx-8 px-8 bg-zinc-50/50 space-y-6 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-black text-xs uppercase tracking-widest">
                        Total Amount
                      </span>
                      <span className="text-4xl font-black text-zinc-900 tracking-tighter italic font-mono">
                        ฿{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      className="w-full h-18 text-xl font-black rounded-3xl shadow-2xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white uppercase tracking-tighter transition-all active:scale-95 py-8"
                      onClick={handleBooking}
                      disabled={
                        isBooking ||
                        !selectedZone ||
                        (isSeated && selectedSeats.length === 0)
                      }
                    >
                      {isBooking ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Ticket className="mr-2 h-6 w-6" />
                      )}
                      {isBooking ? "HOLDING SEATS..." : "CONFIRM BOOKING"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                <Info className="h-6 w-6 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-bold">
                  ตั๋วจะถูกล็อคให้ 15 นาทีหลังจากกดจอง
                  กรุณาชำระเงินในเวลาที่กำหนดเพื่อป้องกันการถูกยกเลิกคิว
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
