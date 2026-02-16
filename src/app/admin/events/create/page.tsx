"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useEvents } from "@/hooks/useEvents";
import { uploadService } from "@/services/uploadService";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  Loader2,
  ImageIcon,
  Info,
  Armchair,
  Layout,
} from "lucide-react";
import Link from "next/link";

// --- 🎯 Helper: สร้างข้อมูลที่นั่ง A1, A2... สำหรับส่ง Backend ---
const generateSeatData = (zones: any[]) => {
  const allSeats: { seatNo: string; zoneName: string; isAvailable: boolean }[] =
    [];

  zones.forEach((zone) => {
    if (zone.type === "seated") {
      const rows = Number(zone.rows) || 0;
      const seatsPerRow = Number(zone.seatsPerRow) || 0;

      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r); // 0 -> A, 1 -> B
        for (let s = 1; s <= seatsPerRow; s++) {
          allSeats.push({
            seatNo: `${rowLabel}${s}`,
            zoneName: zone.name,
            isAvailable: true,
          });
        }
      }
    }
  });
  return allSeats;
};

// --- Helper: วาดผังรวมของทุกโซนต่อกันลงมา ---
const GlobalStadiumPreview = ({ zones }: { zones: any[] }) => {
  if (!zones || zones.length === 0) return null;

  return (
    <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-3xl overflow-hidden bg-zinc-950">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h3 className="text-white font-bold text-lg flex items-center gap-3">
          <Layout className="h-5 w-5 text-emerald-500" />
          Full Stadium Layout Preview
        </h3>
        <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">
          Stage at top
        </span>
      </div>

      <CardContent className="p-12 flex flex-col items-center overflow-x-auto min-h-[400px]">
        <div className="w-full max-w-md mb-16 relative">
          <div className="h-4 bg-zinc-800 rounded-b-[40px] border-x border-b border-zinc-700 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] font-black text-zinc-500 tracking-[1.5em] ml-[1.5em]">
              STAGE
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          {zones.map((zone, idx) => {
            const rows = Math.min(Number(zone.rows) || 0, 10);
            const seats = Math.min(Number(zone.seatsPerRow) || 0, 30);

            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 w-full"
              >
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-black text-emerald-500 uppercase">
                    {zone.name || `ZONE ${idx + 1}`}
                  </span>
                </div>

                <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 flex flex-col items-center gap-1">
                  {zone.type === "standing" ? (
                    <div className="w-48 h-12 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center">
                      <span className="text-[8px] text-indigo-400 font-black tracking-widest uppercase">
                        Standing Area
                      </span>
                    </div>
                  ) : (
                    Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-1">
                        {Array.from({ length: seats }).map((_, sIdx) => (
                          <div
                            key={sIdx}
                            className="w-1.5 h-1.5 rounded-[1px] bg-emerald-500/20"
                          />
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Helper: วาดผังย่อยในแต่ละ Card พร้อม Tooltip ---
const SeatMapPreview = ({ zone }: { zone: any }) => {
  if (!zone) return null;
  const rows = Math.min(Number(zone.rows) || 0, 26);
  const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 50);

  return (
    <div className="relative w-full bg-zinc-950 rounded-2xl p-6 overflow-x-auto shadow-2xl border border-zinc-800">
      <div className="min-w-max flex flex-col items-center gap-1.5">
        {zone.type === "standing" ? (
          <div className="py-12 flex flex-col items-center gap-4 text-center">
            <div className="w-32 h-1 bg-zinc-800 rounded-full" />
            <p className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase">
              Standing Field
              <br />({zone.totalSeats || 0} Capacity)
            </p>
            <div className="w-32 h-1 bg-zinc-800 rounded-full" />
          </div>
        ) : rows > 0 && seatsPerRow > 0 ? (
          Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-zinc-600 w-4 text-center">
                {String.fromCharCode(65 + rIdx)}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }).map((_, sIdx) => {
                  const seatId = `${String.fromCharCode(65 + rIdx)}${sIdx + 1}`;
                  return (
                    <div
                      key={sIdx}
                      title={seatId} // 🎯 แสดงเลขที่นั่งเวลาเอาเมาส์ชี้
                      className="w-2 h-2 rounded-[1px] bg-indigo-500/40 border border-indigo-500/20 hover:bg-emerald-400 hover:scale-150 transition-all cursor-help"
                    />
                  );
                })}
              </div>
              <span className="text-[9px] font-bold text-zinc-600 w-4 text-center">
                {String.fromCharCode(65 + rIdx)}
              </span>
            </div>
          ))
        ) : (
          <div className="py-10 text-zinc-600 text-[10px] uppercase font-bold tracking-widest text-center">
            Enter rows and seats per row
            <br />
            to preview seat map
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { createEvent } = useEvents();

  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      zones: [
        {
          name: "",
          price: 0,
          totalSeats: 0,
          type: "standing",
          rows: 0,
          seatsPerRow: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "zones" });
  const watchZones = useWatch({ control, name: "zones" });
  const imageUrlPreview = watch("imageUrl");

  useEffect(() => {
    watchZones?.forEach((zone, index) => {
      if (zone?.type === "seated") {
        const calculated =
          (Number(zone.rows) || 0) * (Number(zone.seatsPerRow) || 0);
        if (calculated !== Number(zone.totalSeats)) {
          setValue(`zones.${index}.totalSeats`, calculated);
        }
      }
    });
  }, [watchZones, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("imageUrl", URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let finalImageUrl = data.imageUrl;
      if (selectedFile)
        finalImageUrl = await uploadService.uploadImage(selectedFile);

      // 🎯 1. ประมวลผลข้อมูล Zones
      const processedZones = data.zones.map((z: any) => ({
        ...z,
        price: Number(z.price),
        totalSeats: Number(z.totalSeats),
        ...(z.type === "seated"
          ? { rows: Number(z.rows), seatsPerRow: Number(z.seatsPerRow) }
          : {}),
      }));

      // 🎯 2. Generate รายชื่อที่นั่งทั้งหมด (A1, A2...) ส่งไป field seats
      const generatedSeats = generateSeatData(processedZones);

      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        imageUrl: finalImageUrl,
        zones: processedZones,
        seats: generatedSeats, // ✨ ส่งหมายเลขที่นั่งทั้งหมดไปที่ Backend
      };

      if (await createEvent(formattedData)) {
        toast.success(`Event Published with ${generatedSeats.length} seats!`);
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Error creating event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center text-zinc-500 hover:text-indigo-600 font-bold text-sm transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Back
        </Link>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">
          CREATE NEW EVENT
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* Section 1: Info */}
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[40px] overflow-hidden">
          <div className="h-3 bg-indigo-600" />
          <CardHeader className="pt-10 px-10">
            <CardTitle className="text-2xl font-black tracking-tighter">
              1. GENERAL INFORMATION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            <div className="relative group cursor-pointer h-80 rounded-[35px] border-4 border-dashed border-zinc-100 bg-zinc-50 overflow-hidden flex items-center justify-center transition-all hover:border-indigo-200">
              {imageUrlPreview ? (
                <img
                  src={imageUrlPreview}
                  className="w-full h-full object-cover"
                  alt="Banner"
                />
              ) : (
                <div className="text-center space-y-2">
                  <div className="bg-white p-5 rounded-full shadow-xl inline-block text-indigo-600">
                    <Upload />
                  </div>
                  <p className="font-bold text-zinc-400">UPLOAD EVENT COVER</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase">
                  Event Title
                </label>
                <Input
                  {...register("title", { required: true })}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase">
                  Date & Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("date", { required: true })}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase">
                Location / Venue
              </label>
              <Input
                {...register("location", { required: true })}
                className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full p-6 border rounded-[25px] min-h-[160px] border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Designer */}
        <Card className="border-none shadow-2xl shadow-zinc-200/50 rounded-[40px] overflow-hidden">
          <div className="h-3 bg-emerald-500" />
          <CardHeader className="pt-10 px-10 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-black tracking-tighter">
              2. ZONE DESIGNER
            </CardTitle>
            <Button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  price: 0,
                  totalSeats: 0,
                  type: "standing",
                  rows: 0,
                  seatsPerRow: 0,
                })
              }
              className="bg-black text-white hover:bg-zinc-800 rounded-2xl px-8 h-12 font-bold transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> ADD ZONE
            </Button>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-10 rounded-[40px] border border-zinc-100 bg-white hover:border-indigo-200 transition-all duration-500 group relative shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-6 right-6 h-10 w-10 bg-zinc-50 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid md:grid-cols-12 gap-10">
                  <div className="md:col-span-5 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Zone Name
                      </label>
                      <Input
                        {...register(`zones.${index}.name`)}
                        placeholder="e.g. VIP, Rock Zone"
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Price (THB)
                      </label>
                      <Input
                        type="number"
                        {...register(`zones.${index}.price`)}
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/30 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Ticket Type
                      </label>
                      <div className="flex p-1.5 bg-zinc-100 rounded-2xl h-14">
                        <button
                          type="button"
                          onClick={() =>
                            setValue(`zones.${index}.type`, "standing")
                          }
                          className={`flex-1 rounded-xl font-bold text-xs transition-all ${watchZones?.[index]?.type === "standing" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500"}`}
                        >
                          STANDING
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setValue(`zones.${index}.type`, "seated")
                          }
                          className={`flex-1 rounded-xl font-bold text-xs transition-all ${watchZones?.[index]?.type === "seated" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500"}`}
                        >
                          SEATED
                        </button>
                      </div>
                    </div>
                    {watchZones?.[index]?.type === "seated" ? (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-indigo-400 uppercase">
                            Rows (A-Z)
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.rows`)}
                            className="rounded-xl border-indigo-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-indigo-400 uppercase">
                            Seats / Row
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.seatsPerRow`)}
                            className="rounded-xl border-indigo-100"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 animate-in slide-in-from-left-4">
                        <label className="text-[10px] font-black text-emerald-500 uppercase">
                          Max Capacity
                        </label>
                        <Input
                          type="number"
                          {...register(`zones.${index}.totalSeats`)}
                          className="rounded-xl border-emerald-100"
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-7">
                    <SeatMapPreview zone={watchZones?.[index]} />
                    {watchZones?.[index]?.type === "seated" && (
                      <div className="mt-4 flex justify-between px-6 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 italic">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          Total seats in this zone:
                        </span>
                        <span className="text-sm font-black text-indigo-600">
                          {watchZones[index]?.totalSeats || 0}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Global Preview */}
        {watchZones?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <GlobalStadiumPreview zones={watchZones as any[]} />
          </div>
        )}

        <div className="flex items-center justify-end gap-6 pb-24">
          <Button
            type="button"
            onClick={() => router.back()}
            className="text-zinc-400 font-bold hover:text-black tracking-widest text-xs"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-20 px-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[30px] font-black text-xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-3" />
            ) : (
              "PUBLISH EVENT"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
