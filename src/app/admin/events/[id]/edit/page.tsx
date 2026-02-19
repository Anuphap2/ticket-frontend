"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
  ImageIcon,
  Layout,
  Info,
} from "lucide-react";
import Link from "next/link";

// --- 🎯 Helper: สร้างข้อมูลที่นั่งใหม่เมื่อมีการเปลี่ยน Dimensions ---
const generateSeatData = (zones: any[]) => {
  const allSeats: any[] = [];
  zones.forEach((zone) => {
    if (zone.type === "seated") {
      const rows = Math.min(Number(zone.rows) || 0, 26);
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

// --- 🏟️ Stadium Preview Components ---
const GlobalStadiumPreview = ({ zones }: { zones: any[] }) => {
  if (!zones || zones.length === 0) return null;
  return (
    <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-zinc-950">
      <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
        <h3 className="text-white font-bold text-xl flex items-center gap-3">
          <Layout className="h-5 w-5 text-emerald-500" /> STADIUM LAYOUT
        </h3>
        <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">
          Stage at top
        </span>
      </div>
      <CardContent className="p-12 flex flex-col items-center min-h-[400px]">
        <div className="w-full max-w-md mb-16 h-4 bg-zinc-800 rounded-b-[40px] border-x border-b border-zinc-700 flex items-center justify-center shadow-lg">
          <span className="text-[10px] font-black text-zinc-500 tracking-[1.5em] ml-[1.5em]">
            STAGE
          </span>
        </div>
        <div className="flex flex-col items-center gap-10 w-full">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95"
            >
              <span className="px-4 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-emerald-500 uppercase italic">
                {zone.name || `ZONE ${idx + 1}`}
              </span>
              <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 flex flex-col items-center gap-1">
                {zone.type === "standing" ? (
                  <div className="w-48 h-12 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center">
                    <span className="text-[8px] text-indigo-400 font-bold tracking-widest uppercase">
                      Standing Area
                    </span>
                  </div>
                ) : (
                  Array.from({
                    length: Math.min(Number(zone.rows) || 0, 10),
                  }).map((_, rIdx) => (
                    <div key={rIdx} className="flex gap-1">
                      {Array.from({
                        length: Math.min(Number(zone.seatsPerRow) || 0, 30),
                      }).map((_, sIdx) => (
                        <div
                          key={sIdx}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500/20"
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SeatMapPreview = ({ zone }: { zone: any }) => {
  if (!zone) return null;
  const rows = Math.min(Number(zone.rows) || 0, 26);
  const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 50);
  return (
    <div className="relative w-full bg-zinc-950 rounded-[30px] p-8 overflow-x-auto shadow-2xl border border-zinc-800">
      <div className="min-w-max flex flex-col items-center gap-2">
        {zone.type === "standing" ? (
          <div className="py-20 text-center uppercase font-black text-indigo-500 text-xs tracking-[0.3em]">
            Standing Field Mode
          </div>
        ) : rows > 0 && seatsPerRow > 0 ? (
          Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-700 w-5">
                {String.fromCharCode(65 + rIdx)}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: seatsPerRow }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    title={`${String.fromCharCode(65 + rIdx)}${sIdx + 1}`}
                    className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30 border border-white/5 hover:bg-emerald-400 transition-all cursor-help"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-zinc-700 w-5">
                {String.fromCharCode(65 + rIdx)}
              </span>
            </div>
          ))
        ) : (
          <div className="py-20 text-zinc-700 text-[10px] font-bold uppercase tracking-widest text-center italic">
            Waiting for Configuration...
          </div>
        )}
      </div>
    </div>
  );
};

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { updateEvent, fetchEvent, currentEvent } = useEvents();

  const { register, control, handleSubmit, reset, setValue, watch } = useForm({
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

  // 🎯 1. Initial Data Fetching
  useEffect(() => {
    const eventId = Array.isArray(id) ? id[0] : id;
    if (eventId) {
      setIsFetching(true);
      fetchEvent(eventId).finally(() => setIsFetching(false));
    }
  }, [id, fetchEvent]);

  // 🎯 2. Reset Form when currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      const formattedDate = currentEvent.date
        ? new Date(currentEvent.date).toISOString().slice(0, 16)
        : "";
      reset({
        ...currentEvent,
        date: formattedDate,
        description: currentEvent.description || "",
      });
    }
  }, [currentEvent, reset]);

  // 🎯 3. Auto Calculation for Seated Zones
  useEffect(() => {
    watchZones?.forEach((zone, index) => {
      if (zone?.type === "seated") {
        const rows = Number(zone.rows) || 0;
        const seats = Number(zone.seatsPerRow) || 0;
        const total = rows * seats;
        if (total !== Number(zone.totalSeats)) {
          setValue(`zones.${index}.totalSeats`, total);
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
    const eventId = Array.isArray(id) ? id[0] : id;

    try {
      let finalImageUrl = data.imageUrl;
      if (selectedFile) {
        finalImageUrl = await uploadService.uploadImage(selectedFile, eventId);
      }

      // 🔍 ตรวจสอบการเปลี่ยนโครงสร้างที่นั่ง
      let seats = undefined;
      const structuralChange =
        JSON.stringify(
          data.zones.map((z: any) => ({
            r: z.rows,
            s: z.seatsPerRow,
            t: z.type,
          })),
        ) !==
        JSON.stringify(
          currentEvent?.zones?.map((z: any) => ({
            r: z.rows,
            s: z.seatsPerRow,
            t: z.type,
          })),
        );

      if (structuralChange) {
        if (
          confirm(
            "โครงสร้างโซนหรือที่นั่งเปลี่ยนไป ระบบต้องสร้างผังที่นั่งใหม่ทั้งหมด ยืนยันไหม?",
          )
        ) {
          seats = generateSeatData(data.zones);
        } else {
          setIsLoading(false);
          return;
        }
      }

      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        imageUrl: finalImageUrl,
        zones: data.zones.map((z: any) => ({
          ...z,
          price: Number(z.price),
          totalSeats: Number(z.totalSeats),
          availableSeats: z.availableSeats ?? Number(z.totalSeats),
        })),
        seats,
      };

      if (await updateEvent(eventId!, formattedData)) {
        toast.success("อัปเดตงานสำเร็จแล้ว!");
        router.push("/admin");
      }
    } catch (error) {
      toast.error("อัปเดตไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="font-bold text-zinc-400 tracking-widest text-xs">
          RESTORING DATA...
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 space-y-16 antialiased">
      <header className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center text-zinc-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Back
        </Link>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tighter italic">
          EDIT EVENT
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
        {/* Section 1: Info */}
        <Card className="border-none shadow-2xl rounded-[50px] overflow-hidden bg-white">
          <div className="h-4 bg-indigo-600 w-full" />
          <CardContent className="p-12 space-y-12">
            <div className="relative group cursor-pointer h-96 rounded-[40px] border-2 border-dashed border-zinc-100 bg-zinc-50 overflow-hidden flex items-center justify-center transition-all hover:bg-zinc-100">
              {imageUrlPreview ? (
                <img
                  src={imageUrlPreview}
                  className="w-full h-full object-cover"
                  alt="Banner"
                />
              ) : (
                <div className="text-center space-y-2">
                  <Upload size={40} className="mx-auto text-indigo-600" />
                  <p className="font-black text-zinc-300 text-[10px] tracking-widest">
                    CHANGE BANNER
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Event Title
                </label>
                <Input
                  {...register("title", { required: true })}
                  className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-lg font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Date & Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("date", { required: true })}
                  className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-lg"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Location
              </label>
              <Input
                {...register("location", { required: true })}
                className="h-16 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white text-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full p-8 rounded-[30px] border-zinc-100 bg-zinc-50/50 min-h-[150px] focus:bg-white outline-none transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Zones */}
        <Card className="border-none shadow-2xl rounded-[50px] overflow-hidden bg-white">
          <div className="h-4 bg-emerald-500 w-full" />
          <CardHeader className="p-12 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black italic tracking-tighter">
              ZONE DESIGNER
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
              className="rounded-2xl h-14 px-8 bg-zinc-900 text-white font-bold hover:bg-black transition-all"
            >
              <Plus className="mr-2" /> ADD ZONE
            </Button>
          </CardHeader>
          <CardContent className="p-12 space-y-12">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-12 rounded-[50px] border border-zinc-100 bg-zinc-50/30 relative group transition-all duration-500 hover:border-indigo-200"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white text-zinc-300 hover:text-rose-500 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110"
                >
                  <Trash2 size={20} />
                </button>
                <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400">
                          Zone Name
                        </label>
                        <Input
                          {...register(`zones.${index}.name`)}
                          className="h-14 rounded-2xl bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400">
                          Price (THB)
                        </label>
                        <Input
                          type="number"
                          {...register(`zones.${index}.price`)}
                          className="h-14 rounded-2xl bg-white font-bold text-emerald-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400">
                        Seat Type
                      </label>
                      <div className="flex p-2 bg-zinc-100 rounded-[20px]">
                        <button
                          type="button"
                          onClick={() =>
                            setValue(`zones.${index}.type`, "standing")
                          }
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${watchZones?.[index]?.type === "standing" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400"}`}
                        >
                          STANDING
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setValue(`zones.${index}.type`, "seated")
                          }
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${watchZones?.[index]?.type === "seated" ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-400"}`}
                        >
                          SEATED
                        </button>
                      </div>
                    </div>
                    {watchZones?.[index]?.type === "seated" ? (
                      <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400">
                            Rows
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.rows`)}
                            className="h-14 rounded-2xl bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400">
                            Seats/Row
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.seatsPerRow`)}
                            className="h-14 rounded-2xl bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400">
                          Capacity
                        </label>
                        <Input
                          type="number"
                          {...register(`zones.${index}.totalSeats`)}
                          className="h-14 rounded-2xl bg-white"
                        />
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

        {watchZones?.length > 0 && (
          <GlobalStadiumPreview zones={watchZones as any[]} />
        )}

        <div className="flex items-center justify-end gap-8 pb-32">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[10px] font-black text-zinc-400 hover:text-black tracking-[0.2em] uppercase"
          >
            Cancel Changes
          </button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-24 px-20 bg-zinc-900 text-white rounded-[40px] font-black text-2xl shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin mr-3" /> : null}{" "}
            UPDATE EVENT
          </Button>
        </div>
      </form>
    </div>
  );
}
