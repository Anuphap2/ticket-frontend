"use client";

import React, { useEffect, useState, memo } from "react";
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
  Layout,
  Info,
  Armchair,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- Helper: ฟังก์ชันแปลงตัวเลขเป็น A, B, ... Z, AA, AB ---
const getRowLabel = (index: number) => {
  let label = "";
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
};

// --- Helper: สร้างข้อมูลที่นั่งใหม่เมื่อมีการเปลี่ยน Dimensions ---
const generateSeatData = (zones: any[]) => {
  const allSeats: any[] = [];
  zones.forEach((zone) => {
    if (zone.type === "seated") {
      const rows = Math.min(Number(zone.rows) || 0, 26);
      const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 100);
      for (let r = 0; r < rows; r++) {
        const rowLabel = getRowLabel(r);
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

// --- Global Stadium Preview (Memoized) ---
const GlobalStadiumPreview = memo(({ zones }: { zones: any[] }) => {
  if (!zones || zones.length === 0) return null;

  return (
    <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden bg-zinc-950">
      <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Layout className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-white font-bold text-xl tracking-tight">
            STADIUM LAYOUT
          </h3>
        </div>
        <span className="text-zinc-600 text-[10px] font-black tracking-widest uppercase border border-zinc-800 px-3 py-1 rounded-full">
          Live Preview
        </span>
      </div>

      <CardContent className="p-12 flex flex-col items-center min-h-100">
        {/* Stage Area */}
        <div className="w-full max-w-md mb-20 relative">
          <div className="h-2 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />
          <div className="h-6 bg-zinc-800 rounded-b-[40px] border-x border-b border-zinc-700 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
            <span className="text-[9px] font-black text-zinc-400 tracking-[1.5em] ml-[1.5em]">
              STAGE
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-12 w-full">
          {zones.map((zone, idx) => {
            const rows = Math.min(Number(zone.rows) || 0, 8);
            const seats = Math.min(Number(zone.seatsPerRow) || 0, 24);

            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-500"
              >
                <div className="px-4 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase">
                  {zone.name || `ZONE ${idx + 1}`}
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-1 shadow-inner">
                  {zone.type === "standing" ? (
                    <div className="w-48 h-16 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center">
                      <span className="text-[9px] text-indigo-400 font-bold tracking-widest">
                        STANDING FIELD
                      </span>
                    </div>
                  ) : (
                    Array.from({ length: rows }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-1">
                        {Array.from({ length: seats }).map((_, sIdx) => (
                          <div
                            key={sIdx}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shadow-[0_0_5px_rgba(16,185,129,0.3)]"
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
});

GlobalStadiumPreview.displayName = "GlobalStadiumPreview";

// --- Seat Map Preview ---
const SeatMapPreview = memo(({ zone }: { zone: any }) => {
  if (!zone) return null;
  const rows = Math.min(Number(zone.rows) || 0, 26);
  const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 100);

  return (
    <div className="relative w-full bg-zinc-950 rounded-[30px] p-8 border border-zinc-800 shadow-inner">
      {/* Legend */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40" />
          <span className="text-[9px] text-zinc-500 uppercase font-black">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-zinc-500 uppercase font-black">
            Hover
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
        {zone.type === "standing" ? (
          <div className="py-16 text-center">
            <Armchair size={32} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase">
              STANDING AREA READY
            </p>
          </div>
        ) : rows > 0 && seatsPerRow > 0 ? (
          Array.from({ length: rows }).map((_, rIdx) => {
            const rowLabel = getRowLabel(rIdx);

            return (
              <div key={rIdx} className="flex items-center gap-4">
                <span className="text-[10px] font-black text-zinc-700 w-6 text-right shrink-0">
                  {rowLabel}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: seatsPerRow }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      title={`${rowLabel}${sIdx + 1}`}
                      className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30 border border-white/5 hover:bg-emerald-400 hover:scale-150 transition-all cursor-help flex-shrink-0"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black text-zinc-700 w-6 shrink-0">
                  {rowLabel}
                </span>
              </div>
            );
          })
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

SeatMapPreview.displayName = "SeatMapPreview";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

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

  // Initial Data Fetching
  useEffect(() => {
    const eventId = Array.isArray(id) ? id[0] : id;
    if (eventId) {
      setIsFetching(true);
      fetchEvent(eventId).finally(() => setIsFetching(false));
    }
  }, [id, fetchEvent]);

  // Reset Form when currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      const formattedDate = currentEvent.date
        ? new Date(currentEvent.date).toISOString().slice(0, 16)
        : "";
      setOriginalImageUrl(currentEvent.imageUrl);
      reset({
        ...currentEvent,
        date: formattedDate,
        description: currentEvent.description || "",
      });
    }
  }, [currentEvent, reset]);

  // Auto Calculation for Seated Zones
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

  useEffect(() => {
    return () => {
      // Clean up local preview object URL if modified
      if (imageUrlPreview && imageUrlPreview.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrlPreview);
      }
    };
  }, [imageUrlPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("imageUrl", URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setValue("imageUrl", "");
    setSelectedFile(null);
  };

  const onSubmit = async (data: any) => {
    // Basic Validation
    if (!selectedFile && !data.imageUrl && !originalImageUrl) {
      toast.error("Please upload an event cover");
      return;
    }

    if (!data.zones || data.zones.length === 0) {
      toast.error("Please add at least one ticket zone before updating");
      return;
    }

    // Zone Name Validation (Must have at least 1 character that is not a space)
    const hasInvalidName = data.zones.some(
      (zone: any) => !zone.name || zone.name.trim().length === 0,
    );
    if (hasInvalidName) {
      toast.error("Please provide a name for all zones");
      return;
    }

    // Price Validation (Must be greater than 0)
    const hasInvalidPrice = data.zones.some(
      (zone: any) => Number(zone.price) <= 0,
    );
    if (hasInvalidPrice) {
      toast.error("Please set a ticket price greater than 0 for all zones");
      return;
    }

    // Capacity & Seat Validation
    const hasInvalidCapacity = data.zones.some((zone: any) => {
      if (zone.type === "seated") {
        return Number(zone.rows) <= 0 || Number(zone.seatsPerRow) <= 0;
      } else {
        return Number(zone.totalSeats) <= 0;
      }
    });

    if (hasInvalidCapacity) {
      toast.error("Please set a valid capacity or seat layout for all zones");
      return;
    }

    // Grid Size Limit Validation
    const hasOversizedGrid = data.zones.some((zone: any) => {
      if (zone.type === "seated") {
        return Number(zone.rows) > 26 || Number(zone.seatsPerRow) > 100;
      }
      return false;
    });

    if (hasOversizedGrid) {
      toast.error("Maximum grid size is 26 rows by 100 seats per row");
      return;
    }

    setIsLoading(true);
    const eventId = Array.isArray(id) ? id[0] : id;

    try {
      let finalImageUrl: string;
      if (selectedFile) {
        finalImageUrl = await uploadService.uploadImage(selectedFile, eventId);
      } else {
        finalImageUrl =
          (currentEvent as any)?.imageUrl || originalImageUrl || "";
      }

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
            "Zone structure or seating has changed. The system will recreate the entire seating plan. Do you want to proceed?",
          )
        ) {
          seats = generateSeatData(data.zones);
        } else {
          setIsLoading(false);
          return;
        }
      }

      const { imageUrl: _formImageUrl, ...restData } = data;

      const formattedData = {
        ...restData,
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
        toast.success("Event updated successfully!");
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Failed to update the event. Please try again.");
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
      {/* Back Button */}
      <Link
        href="/admin"
        className="inline-flex items-center text-zinc-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
        Back to Dashboard
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-zinc-900 tracking-tighter uppercase italic">
            EDIT EVENT
          </h1>
          <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full" />
        </div>

        {/* 1. General Info */}
        <Card className="border border-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-[40px] overflow-hidden bg-white">
          <div className="h-3 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 w-full" />

          <CardHeader className="px-12 pt-12 pb-6">
            <CardTitle className="text-3xl font-black italic tracking-tight flex items-center gap-4">
              <span className="text-indigo-500/20 text-5xl">01</span>
              <span className="text-zinc-900">GENERAL INFORMATION</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-12 pb-14 space-y-14">
            {/* Image Upload Area */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                Event Banner
                {originalImageUrl && !selectedFile && (
                  <span className="text-emerald-600 text-[10px] font-bold normal-case">
                    ✓ Current image saved
                  </span>
                )}
                {selectedFile && (
                  <span className="text-indigo-600 text-[10px] font-bold normal-case">
                    ✓ New image: {selectedFile.name}
                  </span>
                )}
              </label>

              <div className="relative group cursor-pointer h-105 rounded-[36px] border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-hidden flex items-center justify-center transition-all duration-300 hover:shadow-xl">
                {imageUrlPreview ? (
                  <>
                    <Image
                      src={imageUrlPreview}
                      alt="Preview"
                      fill
                      className="object-cover transition-transform duration-700"
                      sizes="100vw"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-5 right-5 z-20 bg-white/90 backdrop-blur-md hover:bg-white text-zinc-700 hover:text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto text-indigo-600">
                      <Upload size={28} />
                    </div>
                    <p className="font-bold text-zinc-400 tracking-widest text-[11px]">
                      DROP OR CLICK TO UPLOAD EVENT COVER
                    </p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm rounded-[36px]">
                  <div className="bg-white/95 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg">
                    <Upload size={16} className="text-zinc-700" />
                    <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">
                      {imageUrlPreview ? "Change Image" : "Upload Image"}
                    </span>
                  </div>
                  {originalImageUrl && !selectedFile && (
                    <p className="text-white/80 text-[11px] mt-4 font-bold tracking-widest uppercase">
                      Leave unchanged to keep existing image
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Inputs Wrapper */}
            <div className="space-y-8">
              {/* Title & Date */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    Event Title
                  </label>
                  <Input
                    {...register("title", { required: true })}
                    className="h-14 px-5 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-base font-semibold shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    {...register("date", { required: true })}
                    className="h-14 px-5 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-base text-zinc-700 shadow-sm"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  Venue Location
                </label>
                <Input
                  {...register("location", { required: true })}
                  className="h-14 px-5 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-base shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  Description
                  <span className="normal-case font-medium text-zinc-400 ml-2">
                    (optional)
                  </span>
                </label>

                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full p-5 rounded-2xl border border-zinc-200 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none text-base text-zinc-700 placeholder-zinc-400 shadow-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Zone Designer */}
        <Card className="border-none shadow-[0_30px_80px_rgba(0,0,0,0.05)] rounded-[50px] overflow-hidden bg-white">
          <div className="h-4 bg-emerald-500 w-full" />

          <CardHeader className="p-12 pb-0">
            <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-4">
              <span className="text-emerald-500 opacity-20 text-5xl">02</span>
              ZONE DESIGNER
            </CardTitle>
          </CardHeader>

          <CardContent className="p-12 space-y-12">
            {/* Empty State */}
            {fields.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-[40px]">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                  No zones yet. Add your first zone.
                </p>
              </div>
            )}

            {fields.map((field, index) => {
              const zoneType = watchZones?.[index]?.type || "standing";
              const rows = watchZones?.[index]?.rows || 0;
              const seatsPerRow = watchZones?.[index]?.seatsPerRow || 0;
              const calculatedTotal = rows * seatsPerRow;

              return (
                <div
                  key={field.id}
                  className="relative p-12 pt-20 pr-20 rounded-[50px] border border-zinc-100 bg-zinc-50/30 hover:border-emerald-200 transition-all duration-500 group"
                >
                  {/* Zone Badge */}
                  <div className="absolute -top-6 left-12 bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest shadow-lg">
                    ZONE {index + 1}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Delete this zone? This action cannot be undone.",
                        )
                      ) {
                        remove(index);
                      }
                    }}
                    className="absolute top-8 right-8 w-12 h-12 bg-white text-zinc-300 hover:text-rose-500 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 hover:bg-rose-50"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="grid lg:grid-cols-12 gap-12">
                    {/* LEFT SIDE */}
                    <div className="lg:col-span-5 space-y-8">
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase">
                            Zone Name
                          </label>
                          <Input
                            {...register(`zones.${index}.name`)}
                            className="h-14 rounded-2xl bg-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase">
                            Price (THB)
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.price`)}
                            className="h-14 rounded-2xl bg-white font-mono text-emerald-600 font-bold"
                          />
                        </div>
                      </div>

                      {/* Segmented Control */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">
                          Seat Configuration
                        </label>

                        <div className="relative flex p-2 bg-zinc-100 rounded-[25px]">
                          <div
                            className={`absolute top-2 bottom-2 w-1/2 rounded-[20px] bg-white shadow-sm transition-all duration-300 ${
                              zoneType === "seated" ? "translate-x-full" : ""
                            }`}
                          />

                          {["standing", "seated"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setValue(`zones.${index}.type`, type)
                              }
                              className="relative flex-1 py-4 text-[10px] font-black tracking-widest z-10"
                            >
                              {type.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Fields */}
                      {zoneType === "seated" ? (
                        <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400">
                              Rows (Max 100)
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...register(`zones.${index}.rows`, { max: 100 })}
                              className="h-14 rounded-2xl bg-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400">
                              Seats / Row (Max 100)
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              {...register(`zones.${index}.seatsPerRow`, {
                                max: 100,
                              })}
                              className="h-14 rounded-2xl bg-white"
                            />
                          </div>

                          <div className="col-span-2 mt-4 text-sm font-bold text-emerald-600">
                            Total Seats: {calculatedTotal}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in slide-in-from-left-4">
                          <label className="text-[10px] font-black text-zinc-400">
                            Total Capacity
                          </label>
                          <Input
                            type="number"
                            min={1}
                            {...register(`zones.${index}.totalSeats`)}
                            className="h-14 rounded-2xl bg-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="lg:col-span-7">
                      <SeatMapPreview zone={watchZones?.[index]} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Button */}
            <div className="flex justify-center pt-10">
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
                className="rounded-2xl h-14 px-10 bg-gray-800 text-white font-black hover:bg-gray-900 shadow-xl"
              >
                <Plus size={20} className="mr-2" />
                ADD NEW ZONE
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Global Stadium Preview */}
        {watchZones?.length > 0 && (
          <GlobalStadiumPreview zones={watchZones as any[]} />
        )}

        {/* Submit Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-32">
          <div className="flex items-center gap-4 text-zinc-400">
            <Info size={16} />
            <p className="text-xs font-bold uppercase tracking-widest">
              Double check all seat prices before publishing
            </p>
          </div>
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-14 px-6 rounded-3xl border-2 text-md font-black text-red-400 hover:text-red-600 tracking-widest transition-colors uppercase"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-24 px-8 bg-zinc-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mr-3" /> : null}
              UPDATE EVENT
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
