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
  CardFooter,
} from "@/components/ui";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { SeatMap } from "@/components/SeatMap";
import { Navbar } from "@/components/navbar";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);

  // Seat Selection State
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
        console.error("Failed to fetch event details", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleSeatClick = (seatNo: string) => {
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNo));
    } else {
      // Optional: Limit max seats per booking?
      if (selectedSeats.length >= 10) {
        toast.error("Maximum 10 seats per booking");
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      router.push("/login");
      return;
    }

    if (!event) return;

    // Validate Seated Event
    if (event.type === 'seated' && selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setIsBooking(true);

    try {
      const isSeated = event.type === 'seated';
      const bookingQuantity = isSeated ? selectedSeats.length : Number(quantity);

      // 1. ส่งคำขอจอง (Create Booking)
      const response = await bookingService.create({
        eventId: id as string,
        zoneName: selectedZone,
        quantity: bookingQuantity,
        seatNumbers: isSeated ? selectedSeats : undefined,
      });

      // 🎯 แกะกล่องข้อมูลจาก Interceptor
      const res = (response as any).data || response;
      console.log("Booking Initial Response:", res);

      // กรณีที่ 1: สำเร็จทันที หรือเข้าคิวสำเร็จ (ได้ ID มาเลย)
      if (res.status === "confirmed" || res.status === "pending" || res._id) {
        const bId = res._id || res.id || res.bookingId;
        if (bId) {
          router.push(`/bookings/${bId}/payment`);
          return;
        }
      }

      // กรณีที่ 2: ต้องรอคิว (Polling)
      if (res.status === "processing" || res.trackingId) {
        toast("กำลังเข้าคิวจอง... กรุณารอสักครู่");

        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await bookingService.checkStatus(res.trackingId);
            const statusData = (statusResponse as any).data || statusResponse;

            if (statusData.status === "confirmed" || statusData._id) {
              clearInterval(pollInterval);
              setIsBooking(false);
              toast.success("เข้าคิวสำเร็จ!");
              router.push(`/bookings/${statusData._id || statusData.id}/payment`);
            }
            else if (statusData.status === "failed" || statusData.status === "cancelled") {
              clearInterval(pollInterval);
              setIsBooking(false);
              toast.error("ขออภัย ที่นั่งในโซนนี้เต็มแล้ว");
            }
          } catch (e) {
            console.error("Polling Error:", e);
            clearInterval(pollInterval);
            setIsBooking(false);
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      setIsBooking(false);
      toast.error(error.response?.data?.message || "การจองขัดข้อง");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500">Event not found.</p>
      </div>
    );
  }

  const selectedZoneDetails = event.zones.find((z) => z.name === selectedZone);
  const isSeated = event.type === 'seated';

  // Calculate Taken Seats from Event Data
  const takenSeats = event.seats
    ? event.seats.filter(s => !s.isAvailable).map(s => s.seatNo)
    : [];

  // Calculate Price
  const currentPrice = selectedZoneDetails ? selectedZoneDetails.price : 0;
  const totalPrice = isSeated
    ? currentPrice * selectedSeats.length
    : currentPrice * quantity;

  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
      <Navbar />

      {/* Hero Header with Blur Background */}
      <div className="relative h-96 w-full bg-zinc-900 overflow-hidden">
        {event.imageUrl && (
          <>
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover opacity-60 blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
          </>
        )}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
          <div className="mx-auto max-w-7xl">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${isSeated ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {isSeated ? 'Reserved Seating' : 'General Admission'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 shadow-black drop-shadow-lg">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>{format(new Date(event.date), "PPP p")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (Description & Seat Map) */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>About Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </CardContent>
            </Card>

            {isSeated ? (
              <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-zinc-100 border-b border-zinc-200">
                  <CardTitle className="flex justify-between items-center">
                    <span>Select Seats</span>
                    <span className="text-sm font-normal text-zinc-500">Stage is at the top</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <SeatMap
                    rows={event.rows || 10}
                    seatsPerRow={event.seatsPerRow || 20}
                    takenSeats={takenSeats}
                    selectedSeats={selectedSeats}
                    onSeatClick={handleSeatClick}
                    price={selectedZoneDetails?.price || 0}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-none bg-indigo-50 border-indigo-100">
                <CardContent className="p-6 flex items-start gap-4">
                  <Ticket className="w-10 h-10 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg text-indigo-900 mb-1">General Admission</h3>
                    <p className="text-indigo-700">This is a standing event. Spaces are available on a first-come, first-served basis within your selected zone.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-none sticky top-24">
              <CardHeader className="bg-zinc-900 text-white rounded-t-lg">
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Select Zone
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => {
                      setSelectedZone(e.target.value);
                      // Clear seats/quantity on zone change if needed, but for now keep it simple
                    }}
                    className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  >
                    {event.zones.map((zone) => (
                      <option key={zone.name} value={zone.name}>
                        {zone.name} - ฿{zone.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {!isSeated && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                )}

                {isSeated && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Selected Seats ({selectedSeats.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map(seat => (
                          <span key={seat} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm font-bold border border-indigo-200">
                            {seat}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-400 text-sm italic">No seats selected</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-zinc-200 pt-4 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-600">Price per ticket</span>
                    <span>฿{selectedZoneDetails?.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      ฿{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50 rounded-b-lg">
                <Button
                  className="w-full py-6 text-lg font-bold shadow-md hover:shadow-xl transition-all"
                  onClick={handleBooking}
                  disabled={isBooking || !selectedZone || (isSeated && selectedSeats.length === 0)}
                  isLoading={isBooking}
                >
                  {isBooking ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
