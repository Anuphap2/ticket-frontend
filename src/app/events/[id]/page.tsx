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
  ShoppingBag,
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

  // 2. คำนวณที่นั่งที่ไม่ว่าง (Polling)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const ticketsRes = await api.get(`/tickets/event/${id}`);
        const ticketsData = ticketsRes.data?.data || ticketsRes.data;
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } catch (error) {
        console.error("Polling Error:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const selectedZoneDetails = event?.zones.find((z) => z.name === selectedZone);
  const isSeated = selectedZoneDetails?.type === "seated";

  const takenSeats = useMemo(() => {
    return tickets
      .filter((t) => t.zoneName === selectedZone && t.status !== "available")
      .map((t) => t.seatNumber);
  }, [tickets, selectedZone]);

  // 🎯 Helper: คำนวณสถานะสต็อก
  const getStockStatus = (count: number) => {
    if (count <= 0) return { color: "text-rose-500", label: "SOLD OUT", bg: "bg-rose-50" };
    if (count <= 10) return { color: "text-amber-500", label: `${count} LEFT`, bg: "bg-amber-50" };
    return { color: "text-emerald-500", label: `${count} AVAILABLE`, bg: "bg-emerald-50" };
  };

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
    if (isSeated && selectedSeats.some((s) => takenSeats.includes(s))) {
      toast.error("ขออภัย มีบางที่นั่งไม่ว่างแล้ว");
      return;
    }

    setIsBooking(true);
    const bookingQuantity = isSeated ? selectedSeats.length : quantity;
    const formattedSeats = isSeated ? selectedSeats : undefined;

    try {
      const response = await bookingService.create({
        eventId: id as string,
        zoneName: selectedZone,
        quantity: bookingQuantity,
        seatNumbers: formattedSeats,
      });

      const res = response.data?.data || response.data || response;
      if (res._id || res.id) {
        toast.success("จองที่นั่งสำเร็จ!");
        router.push(`/bookings/${res._id || res.id}/payment`);
        return;
      }

      if (res.trackingId) {
        toast.loading("ระบบกำลังจัดลำดับคิวให้คุณ...", { id: "queue-status" });
        const checkQueue = setInterval(async () => {
          const statusRes = await bookingService.checkStatus(res.trackingId);
          const statusData = statusRes?.data?.data || statusRes?.data || statusRes;
          if (statusData?.status === "confirmed") {
            clearInterval(checkQueue);
            toast.success("ถึงคิวของคุณแล้ว!", { id: "queue-status" });
            router.push(`/bookings/${statusData.bookingId}/payment`);
          } else if (statusData?.status === "failed") {
            clearInterval(checkQueue);
            setIsBooking(false);
            toast.error(statusData.message || "การจองล้มเหลว", { id: "queue-status" });
          }
        }, 2000);
      }
    } catch (error: any) {
      setIsBooking(false);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const totalPrice = (selectedZoneDetails?.price || 0) * (isSeated ? selectedSeats.length : quantity);
  const hasInvalidSeat = selectedSeats.some((s) => takenSeats.includes(s));
  const soldPercent = Math.round(((selectedZoneDetails?.totalSeats - selectedZoneDetails?.availableSeats) / selectedZoneDetails?.totalSeats) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Navbar />
      <div className="relative h-[40vh] w-full bg-black overflow-hidden">
        {event?.imageUrl && <Image src={event.imageUrl} alt="banner" fill className="object-cover opacity-50 scale-105" />}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent" />
        <div className="absolute bottom-8 left-0 w-full px-10 md:px-20">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter italic uppercase">{event?.title}</h1>
          <div className="flex gap-4 mt-4">
            <Badge className="bg-indigo-600 px-4 py-1.5 rounded-full"><Calendar size={12} className="mr-2" />{event && format(new Date(event.date), "dd MMM yyyy")}</Badge>
            <Badge className="bg-zinc-900 px-4 py-1.5 rounded-full"><MapPin size={12} className="mr-2" />{event?.location}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-6 relative z-10">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-white">
            <CardHeader className="bg-zinc-50 border-b flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
              <CardTitle className="text-xl font-black italic flex items-center gap-2 uppercase">
                <Armchair className="text-indigo-600" /> SEAT MAP : {selectedZone}
              </CardTitle>
              <div className="flex flex-wrap bg-zinc-200 p-1 rounded-2xl gap-1">
                {event?.zones.map((z) => {
                  const status = getStockStatus(z.availableSeats);
                  const isActive = selectedZone === z.name;
                  return (
                    <button
                      key={z.name}
                      onClick={() => { setSelectedZone(z.name); setSelectedSeats([]); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[90px] ${isActive ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-300/50"}`}
                    >
                      <span className="uppercase">{z.name}</span>
                      <span className={`text-[9px] font-black mt-0.5 uppercase ${status.color}`}>{status.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-zinc-950">
              {isSeated ? (
                <div className="p-8">
                  <div className="flex justify-center gap-6 mb-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-800 rounded-sm" /> Available</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-sm" /> Selected</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-700 opacity-40 rounded-sm" /> Occupied</span>
                  </div>
                  <div className="flex justify-center overflow-x-auto pb-4">
                    <SeatMap rows={selectedZoneDetails?.rows || 0} seatsPerRow={selectedZoneDetails?.seatsPerRow || 0} takenSeats={takenSeats} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} selectedZone={selectedZone} price={selectedZoneDetails?.price || 0} />
                  </div>
                  <div className="mt-10 py-3 bg-zinc-900 text-center text-[10px] text-zinc-700 tracking-[2em] font-black rounded-xl border border-white/5 uppercase">STAGE</div>
                </div>
              ) : (
                <div className="py-24 text-center">
                  <Users size={48} className="mx-auto text-indigo-500/20 mb-4" />
                  <h2 className="text-white text-2xl font-black italic uppercase">General Admission Area</h2>
                  <p className={`text-xs font-bold mt-2 uppercase ${getStockStatus(selectedZoneDetails?.availableSeats || 0).color}`}>
                    {selectedZoneDetails?.availableSeats <= 0 ? 'SOLD OUT' : `ONLY ${selectedZoneDetails?.availableSeats} TICKETS LEFT`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-[32px] p-10 border-none shadow-lg">
            <h3 className="font-black italic uppercase flex items-center gap-2 mb-6 text-zinc-400 tracking-widest"><Info size={18} /> Description</h3>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-lg">{event?.description}</p>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden sticky top-24">
            <div className="bg-zinc-900 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selected Zone</span>
                  <h2 className="text-3xl font-black italic uppercase mt-1">{selectedZone}</h2>
                </div>
                <Badge className={`${getStockStatus(selectedZoneDetails?.availableSeats || 0).bg} ${getStockStatus(selectedZoneDetails?.availableSeats || 0).color} border-none font-black text-[10px] px-3`}>
                  {selectedZoneDetails?.availableSeats} LEFT
                </Badge>
              </div>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                  <span>Sold Progress</span>
                  <span>{soldPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${soldPercent}%` }} />
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <span className="text-zinc-400 text-xs font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-indigo-600 font-mono">฿{selectedZoneDetails?.price.toLocaleString()}</span>
              </div>
              {!isSeated ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Quantity</label>
                  <Input type="number" min={1} max={selectedZoneDetails?.availableSeats > 10 ? 10 : selectedZoneDetails?.availableSeats} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="h-14 rounded-2xl font-black text-lg" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selected ({selectedSeats.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(s => <Badge key={s} className="bg-indigo-50 text-indigo-600 border-none font-bold px-3 py-1 font-mono">{s}</Badge>)}
                    {selectedSeats.length === 0 && <span className="text-zinc-400 text-xs italic">Select on map</span>}
                  </div>
                </div>
              )}
              <div className="pt-4">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total</span>
                  <span className="text-4xl font-black text-zinc-900 font-mono tracking-tighter italic">฿{totalPrice.toLocaleString()}</span>
                </div>
                <Button
                  onClick={handleBooking}
                  disabled={isBooking || selectedZoneDetails?.availableSeats <= 0 || (isSeated && (selectedSeats.length === 0 || hasInvalidSeat))}
                  className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:bg-zinc-300"
                >
                  {isBooking ? <Loader2 className="animate-spin mr-2" /> : <TicketIcon className="mr-3" />}
                  {selectedZoneDetails?.availableSeats <= 0 ? "SOLD OUT" : isBooking ? "PROCESSING..." : hasInvalidSeat ? "SEAT TAKEN" : "CONFIRM ORDER"}
                </Button>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                <Timer className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">Reservation held for 15 minutes after confirmation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}