"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Event, Ticket } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/eventService";
import { bookingService } from "@/services/bookingService";
import { ROUTES } from "@/lib/constants";
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

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

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

  const main = useRef<HTMLDivElement | null>(null);
  const smoother = useRef<ScrollSmoother | null>(null);
  // Stored so the polling interval can be cleared on unmount
  const ticketPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const ctx = gsap.context(() => {
      smoother.current = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
      });
    }, main);

    return () => ctx.revert();
  }, []);

  // 1. Initial Fetch — uses service layer, not raw api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, ticketsData] = await Promise.all([
          eventService.getById(id as string),
          eventService.getTicketsByEvent(id as string),
        ]);

        setEvent(eventData);
        setTickets(ticketsData);

        if (eventData?.zones?.length > 0) {
          setSelectedZone(eventData.zones[0].name);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // 2. Polling for unavailable seats — interval stored in ref and cleared on unmount
  useEffect(() => {
    if (!id) return;
    ticketPollRef.current = setInterval(async () => {
      try {
        const ticketsData = await eventService.getTicketsByEvent(id as string);
        setTickets(ticketsData);
      } catch (error) {
        console.error("Polling Error:", error);
      }
    }, 5000);
    return () => {
      if (ticketPollRef.current) clearInterval(ticketPollRef.current);
    };
  }, [id]);

  const selectedZoneDetails = event?.zones.find((z) => z.name === selectedZone);
  const isSeated = selectedZoneDetails?.type === "seated";

  const takenSeats = useMemo(() => {
    return tickets
      .filter((t) => t.zoneName === selectedZone && t.status !== "available")
      .map((t) => t.seatNumber);
  }, [tickets, selectedZone]);

  const getStockStatus = (count: number) => {
    if (count <= 0)
      return { color: "text-rose-500", label: "SOLD OUT", bg: "bg-rose-50" };
    if (count <= 10)
      return {
        color: "text-amber-500",
        label: `${count} LEFT`,
        bg: "bg-amber-50",
      };
    return {
      color: "text-emerald-500",
      label: `${count} AVAILABLE`,
      bg: "bg-emerald-50",
    };
  };

  const handleSeatClick = (seatNo: string) => {
    if (takenSeats.includes(seatNo)) {
      toast.error("This seat is already booked");
      return;
    }
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("Maximum 6 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login before booking");
      router.push(ROUTES.login);
      return;
    }
    if (isSeated && selectedSeats.some((s) => takenSeats.includes(s))) {
      toast.error("Sorry, some selected seats are no longer available");
      return;
    }

    setIsBooking(true);
    const bookingQuantity = isSeated
      ? selectedSeats.length
      : Math.max(1, quantity);
    const formattedSeats = isSeated ? selectedSeats : undefined;

    try {
      const response = await bookingService.create({
        eventId: id as string,
        zoneName: selectedZone,
        quantity: bookingQuantity,
        seatNumbers: formattedSeats,
      });

      // Direct booking — backend returned an ID immediately
      if (response._id) {
        toast.success("Booking successful!");
        router.push(ROUTES.bookingPayment(response._id));
        return;
      }

      // Queue path — release the button lock immediately; user sees queue toast
      if (response.trackingId) {
        setIsBooking(false);
        toast.loading("Assigning you to the queue...", { id: "queue-status" });
        const checkQueue = setInterval(async () => {
          try {
            const statusData = await bookingService.checkStatus(response.trackingId!);
            if (statusData?.status === "confirmed" && statusData.bookingId) {
              clearInterval(checkQueue);
              toast.success("It's your turn!", { id: "queue-status" });
              router.push(ROUTES.bookingPayment(statusData.bookingId));
            } else if (statusData?.status === "failed") {
              clearInterval(checkQueue);
              toast.error(statusData.message || "Booking failed", { id: "queue-status" });
            }
          } catch {
            // Polling errors are transient — keep retrying
          }
        }, 2000);
        return;
      }

      // Unexpected response shape
      setIsBooking(false);
    } catch (error: any) {
      setIsBooking(false);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  // คำนวณราคารวม (หาก quantity เป็น 0 ตอนกำลังลบตัวเลข ให้คิดเป็น 1 ชั่วคราวเพื่อให้ไม่แสดงยอด 0)
  const totalPrice =
    (selectedZoneDetails?.price || 0) *
    (isSeated ? selectedSeats.length : quantity || 1);
  const hasInvalidSeat = selectedSeats.some((s) => takenSeats.includes(s));
  const total = selectedZoneDetails?.totalSeats || 0;
  const avail = selectedZoneDetails?.availableSeats || 0;
  const soldPercent =
    total > 0 ? Math.round(((total - avail) / total) * 100) : 0;

  return (
    <div ref={main}>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {loading ? (
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600 h-12 w-12" />
            </div>
          ) : (
            <div className="min-h-screen bg-zinc-50 pb-20">
              <Navbar />
              <div className="relative h-[40vh] w-full bg-black overflow-hidden">
                {event?.imageUrl && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${event.imageUrl}`}
                    alt="banner"
                    fill
                    className="object-cover opacity-50 scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent" />
                <div className="absolute bottom-8 left-0 w-full px-10 md:px-20">
                  <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter italic uppercase">
                    {event?.title}
                  </h1>
                  <div className="flex gap-4 mt-4">
                    <Badge className="bg-indigo-600 px-4 py-1.5 rounded-full">
                      <Calendar size={12} className="mr-2" />
                      {event && format(new Date(event.date), "dd MMM yyyy")}
                    </Badge>
                    <Badge className="bg-zinc-900 px-4 py-1.5 rounded-full">
                      <MapPin size={12} className="mr-2" />
                      {event?.location}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-6 relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  {/* ── Zone Selector ───────────────────────────── */}
                  {event?.zones && event.zones.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Select Zone</p>
                      <div className={`grid gap-3 ${event.zones.length === 1 ? "grid-cols-1" : event.zones.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                        {event.zones.map((z) => {
                          const status = getStockStatus(z.availableSeats);
                          const isActive = selectedZone === z.name;
                          const soldOut = z.availableSeats <= 0;
                          return (
                            <button
                              key={z.name}
                              disabled={soldOut}
                              onClick={() => { setSelectedZone(z.name); setSelectedSeats([]); setQuantity(1); }}
                              className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${isActive ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
                                  : soldOut ? "border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed"
                                    : "border-zinc-100 bg-white hover:border-indigo-300 hover:shadow-md"}`}
                            >
                              {isActive && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-black text-zinc-900 text-sm uppercase tracking-tight">{z.name}</span>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${z.type === "seated" ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-500"}`}>
                                  {z.type}
                                </span>
                              </div>
                              <div className="text-xl font-black text-indigo-600 font-mono leading-none">฿{z.price.toLocaleString()}</div>
                              <div className={`text-[9px] font-black uppercase mt-1.5 ${status.color}`}>{status.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Seat Map Card ─────────────────────────────── */}
                  <Card className="rounded-[32px] overflow-hidden border-none shadow-2xl bg-white">
                    <div className="flex items-center gap-2 px-6 pt-5 pb-2">
                      <Armchair size={16} className="text-indigo-600" />
                      <span className="font-black text-sm uppercase italic text-zinc-700 tracking-tight">{selectedZone}</span>
                    </div>
                    <CardContent className="p-0 bg-zinc-950">
                      {isSeated ? (
                        <SeatMap
                          rows={selectedZoneDetails?.rows || 0}
                          seatsPerRow={selectedZoneDetails?.seatsPerRow || 0}
                          takenSeats={takenSeats}
                          selectedSeats={selectedSeats}
                          onSeatClick={handleSeatClick}
                          selectedZone={selectedZone}
                          price={selectedZoneDetails?.price || 0}
                        />
                      ) : (
                        <div className="py-24 text-center">
                          <Users
                            size={48}
                            className="mx-auto text-indigo-500/20 mb-4"
                          />
                          <h2 className="text-white text-2xl font-black italic uppercase">
                            General Admission Area
                          </h2>
                          <p
                            className={`text-xs font-bold mt-2 uppercase ${getStockStatus(selectedZoneDetails?.availableSeats || 0).color}`}
                          >
                            {(selectedZoneDetails?.availableSeats || 0) <= 0
                              ? "SOLD OUT"
                              : `ONLY ${selectedZoneDetails?.availableSeats || 0} TICKETS LEFT`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-[32px] p-10 border-none shadow-lg">
                    <h3 className="font-black italic uppercase flex items-center gap-2 mb-6 text-zinc-400 tracking-widest">
                      <Info size={18} /> Description
                    </h3>
                    <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-lg">
                      {event?.description}
                    </p>
                  </Card>
                </div>

                <div className="lg:col-span-4">
                  <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden sticky top-24">
                    <div className="bg-zinc-900 p-8 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Selected Zone
                          </span>
                          <h2 className="text-3xl font-black italic uppercase mt-1">
                            {selectedZone}
                          </h2>
                        </div>
                        <Badge
                          className={`${getStockStatus(selectedZoneDetails?.availableSeats || 0).bg} ${getStockStatus(selectedZoneDetails?.availableSeats || 0).color} border-none font-black text-[10px] px-3`}
                        >
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
                          <div
                            className="h-full bg-indigo-600 transition-all duration-1000"
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                        <span className="text-zinc-400 text-xs font-bold uppercase">
                          Price
                        </span>
                        <span className="text-2xl font-black text-indigo-600 font-mono">
                          ฿{selectedZoneDetails?.price.toLocaleString()}
                        </span>
                      </div>
                      {!isSeated ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Quantity
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={Math.min(
                              selectedZoneDetails?.availableSeats || 0,
                              10,
                            )}
                            value={quantity === 0 ? "" : quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const maxQty = Math.min(
                                selectedZoneDetails?.availableSeats || 0,
                                10,
                              );

                              if (val > maxQty) {
                                setQuantity(maxQty);
                                // เพิ่ม id ตรงนี้เพื่อป้องกันการเด้งแจ้งเตือนซ้ำซ้อน
                                toast.error(
                                  `Maximum ${maxQty} tickets allowed per booking`,
                                  {
                                    id: "qty-limit-error",
                                  },
                                );
                              } else {
                                setQuantity(val);
                              }
                            }}
                            onBlur={() => {
                              if (quantity < 1) setQuantity(1);
                            }}
                            className="h-14 rounded-2xl font-black text-lg"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Selected ({selectedSeats.length})
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedSeats.map((s) => (
                              <Badge
                                key={s}
                                className="bg-indigo-50 text-indigo-600 border-none font-bold px-3 py-1 font-mono"
                              >
                                {s}
                              </Badge>
                            ))}
                            {selectedSeats.length === 0 && (
                              <span className="text-zinc-400 text-xs italic">
                                Select on map
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="pt-4">
                        <div className="flex justify-between items-end mb-8">
                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                            Total
                          </span>
                          <span className="text-4xl font-black text-zinc-900 font-mono tracking-tighter italic">
                            ฿{totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          onClick={handleBooking}
                          // ปุ่มจะใช้งานไม่ได้ถ้า quantity < 1
                          disabled={
                            isBooking ||
                            (selectedZoneDetails?.availableSeats || 0) <= 0 ||
                            (isSeated &&
                              (selectedSeats.length === 0 || hasInvalidSeat)) ||
                            (!isSeated && quantity < 1)
                          }
                          className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:bg-zinc-300"
                        >
                          {isBooking ? (
                            <Loader2 className="animate-spin mr-2" />
                          ) : (
                            <TicketIcon className="mr-3" />
                          )}
                          {(selectedZoneDetails?.availableSeats || 0) <= 0
                            ? "SOLD OUT"
                            : isBooking
                              ? "PROCESSING..."
                              : hasInvalidSeat
                                ? "SEAT TAKEN"
                                : "CONFIRM ORDER"}
                        </Button>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                        <Timer className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-800 font-bold leading-tight uppercase">
                          Reservation held for 15 minutes after confirmation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
