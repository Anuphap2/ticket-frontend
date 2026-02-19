"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
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
} from "@/components/ui";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  Loader2,
  Layout,
  Info,
  Armchair,
} from "lucide-react";
import Link from "next/link";

// --- 🎯 Helper: สร้างที่นั่งแบบจำกัดเพื่อ Performance ---
const generateSeatData = (zones: any[]) => {
  const allSeats: any[] = [];
  zones.forEach((zone) => {
    if (zone.type === "seated") {
      const rows = Math.min(Number(zone.rows) || 0, 26); // จำกัดแค่ A-Z
      const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 100);

      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
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

// --- 🏟️ Global Stadium Preview (Memoized) ---
const GlobalStadiumPreview = memo(({ zones }: { zones: any[] }) => {
  if (!zones || zones.length === 0) return null;

  return (
    <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-zinc-950">
      <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Layout className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-white font-bold text-xl tracking-tight">STADIUM LAYOUT</h3>
        </div>
        <span className="text-zinc-600 text-[10px] font-black tracking-widest uppercase border border-zinc-800 px-3 py-1 rounded-full">
          Live Preview
        </span>
      </div>

      <CardContent className="p-12 flex flex-col items-center min-h-[400px]">
        {/* Stage Area */}
        <div className="w-full max-w-md mb-20 relative">
          <div className="h-2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
          <div className="h-6 bg-zinc-800 rounded-b-[40px] border-x border-b border-zinc-700 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
            <span className="text-[9px] font-black text-zinc-400 tracking-[1.5em] ml-[1.5em]">STAGE</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-12 w-full">
          {zones.map((zone, idx) => {
            const rows = Math.min(Number(zone.rows) || 0, 8);
            const seats = Math.min(Number(zone.seatsPerRow) || 0, 24);

            return (
              <div key={idx} className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="px-4 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                  {zone.name || `ZONE ${idx + 1}`}
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 shadow-inner">
                  {zone.type === "standing" ? (
                    <div className="w-48 h-16 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center">
                      <span className="text-[9px] text-indigo-400 font-bold tracking-widest">STANDING FIELD</span>
                    </div>
                  ) : (
                    Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-1">
                        {Array.from({ length: seats }).map((_, sIdx) => (
                          <div key={sIdx} className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
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
});

// --- 💺 Seat Map Preview ---
const SeatMapPreview = memo(({ zone }: { zone: any }) => {
  if (!zone) return null;
  const rows = Math.min(Number(zone.rows) || 0, 26);
  const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 40);

  return (
    <div className="relative w-full bg-zinc-950 rounded-[30px] p-8 border border-zinc-800 shadow-inner">
      {/* Legend */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
          <span className="text-[9px] text-zinc-500 uppercase font-black">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-zinc-500 uppercase font-black">Hover</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
        {zone.type === "standing" ? (
          <div className="py-16 text-center">
            <Armchair size={32} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase">STANDING AREA READY</p>
          </div>
        ) : rows > 0 && seatsPerRow > 0 ? (
          Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-700 w-5">{String.fromCharCode(65 + rIdx)}</span>
              <div className="flex gap-1.5">
                {Array.from({ length: seatsPerRow }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    title={`${String.fromCharCode(65 + rIdx)}${sIdx + 1}`}
                    className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30 border border-white/5 hover:bg-emerald-400 hover:scale-150 transition-all cursor-help"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-zinc-700 w-5">{String.fromCharCode(65 + rIdx)}</span>
            </div>
          ))
        ) : (
          <div className="py-20 text-zinc-700 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
            <Info size={24} className="opacity-20" />
            Define dimensions to preview
          </div>
        )}
      </div>
    </div>
  );
});

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
      zones: [{ name: "", price: 0, totalSeats: 0, type: "standing", rows: 0, seatsPerRow: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "zones" });
  const watchZones = useWatch({ control, name: "zones" });
  const imageUrlPreview = watch("imageUrl");

  // Update total seats logic
  useEffect(() => {
    watchZones?.forEach((zone, index) => {
      if (zone?.type === "seated") {
        const rows = Number(zone.rows) || 0;
        const seats = Number(zone.seatsPerRow) || 0;
        const currentTotal = Number(zone.totalSeats);
        if (rows * seats !== currentTotal) {
          setValue(`zones.${index}.totalSeats`, rows * seats);
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
    // Basic Validation
    if (!selectedFile && !data.imageUrl) {
      toast.error("Please upload an event cover");
      return;
    }
    
    setIsLoading(true);
    try {
      let finalImageUrl = data.imageUrl;
      if (selectedFile) finalImageUrl = await uploadService.uploadImage(selectedFile);

      const processedZones = data.zones.map((z: any) => ({
        ...z,
        price: Number(z.price),
        totalSeats: Number(z.totalSeats),
        ...(z.type === "seated" ? { rows: Number(z.rows), seatsPerRow: Number(z.seatsPerRow) } : {}),
      }));

      const generatedSeats = generateSeatData(processedZones);

      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        imageUrl: finalImageUrl,
        zones: processedZones,
        seats: generatedSeats,
      };

      const result = await createEvent(formattedData);
      if (result) {
        toast.success(`EVENT PUBLISHED! Total seats: ${generatedSeats.length}`);
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 space-y-16 antialiased">
      {/* Back Button */}
      <Link href="/admin" className="inline-flex items-center text-zinc-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-zinc-900 tracking-tighter uppercase italic">NEW CONCERT</h1>
          <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>

        {/* 1. General Info */}
        <Card className="border-none shadow-[0_30px_80px_rgba(0,0,0,0.05)] rounded-[50px] overflow-hidden bg-white">
          <div className="h-4 bg-indigo-600 w-full" />
          <CardHeader className="p-12 pb-0">
            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-4">
              <span className="text-indigo-600 opacity-20 text-5xl">01</span> GENERAL INFORMATION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 space-y-12">
            {/* Image Upload Area */}
            <div className="relative group cursor-pointer h-[400px] rounded-[40px] border-2 border-dashed border-zinc-100 bg-zinc-50/50 overflow-hidden flex items-center justify-center transition-all hover:bg-zinc-50">
              {imageUrlPreview ? (
                <img src={imageUrlPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <Upload size={32} />
                  </div>
                  <p className="font-black text-zinc-300 tracking-widest text-[10px]">DROP EVENT POSTER HERE</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Event Title</label>
                <Input {...register("title", { required: true })} className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-lg font-bold" placeholder="Born Pink World Tour..." />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date & Time</label>
                <Input type="datetime-local" {...register("date", { required: true })} className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-lg" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Venue Location</label>
              <Input {...register("location", { required: true })} className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-lg" placeholder="Rajamangala Stadium, Bangkok" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Zone Designer */}
        <Card className="border-none shadow-[0_30px_80px_rgba(0,0,0,0.05)] rounded-[50px] overflow-hidden bg-white">
          <div className="h-4 bg-emerald-500 w-full" />
          <CardHeader className="p-12 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-4">
              <span className="text-emerald-500 opacity-20 text-5xl">02</span> ZONE DESIGNER
            </CardTitle>
            <Button type="button" onClick={() => append({ name: "", price: 0, totalSeats: 0, type: "standing", rows: 0, seatsPerRow: 0 })} className="rounded-2xl h-14 px-8 bg-zinc-900 text-white font-black hover:bg-black transition-all shadow-xl">
              <Plus size={20} className="mr-2" /> ADD ZONE
            </Button>
          </CardHeader>
          <CardContent className="p-12 space-y-12">
            {fields.map((field, index) => (
              <div key={field.id} className="p-12 rounded-[50px] border border-zinc-100 bg-zinc-50/30 relative hover:border-emerald-200 transition-all duration-500 group">
                <button type="button" onClick={() => remove(index)} className="absolute top-8 right-8 w-12 h-12 bg-white text-zinc-300 hover:text-rose-500 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110">
                  <Trash2 size={20} />
                </button>
                
                <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 space-y-8">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Zone Name</label>
                        <Input {...register(`zones.${index}.name`)} className="h-14 rounded-2xl bg-white" placeholder="AL1, VIP" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Price (THB)</label>
                        <Input type="number" {...register(`zones.${index}.price`)} className="h-14 rounded-2xl bg-white font-mono text-emerald-600 font-bold" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase">Seat Configuration</label>
                      <div className="flex p-2 bg-zinc-100 rounded-[25px]">
                        {["standing", "seated"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue(`zones.${index}.type`, type as any)}
                            className={`flex-1 py-4 rounded-[20px] text-[10px] font-black tracking-widest transition-all ${watchZones?.[index]?.type === type ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400"}`}
                          >
                            {type.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {watchZones?.[index]?.type === "seated" ? (
                      <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400">Rows (Max 26)</label>
                          <Input type="number" {...register(`zones.${index}.rows`)} className="h-14 rounded-2xl bg-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400">Seats/Row</label>
                          <Input type="number" {...register(`zones.${index}.seatsPerRow`)} className="h-14 rounded-2xl bg-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in slide-in-from-left-4">
                        <label className="text-[10px] font-black text-zinc-400">Total Capacity</label>
                        <Input type="number" {...register(`zones.${index}.totalSeats`)} className="h-14 rounded-2xl bg-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:col-span-7">
                    <SeatMapPreview zone={watchZones?.[index]} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Global Stadium Preview */}
        {watchZones?.length > 0 && <GlobalStadiumPreview zones={watchZones as any[]} />}

        {/* Submit Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-32">
          <div className="flex items-center gap-4 text-zinc-400">
            <Info size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Double check all seat prices before publishing</p>
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => router.back()} className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 tracking-widest transition-colors uppercase">Cancel</button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-24 px-16 bg-zinc-900 text-white rounded-[40px] font-black text-2xl shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "PUBLISH NOW"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}