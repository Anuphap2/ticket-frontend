"use client";

import React, { useEffect, useState } from "react";
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
  CardFooter,
} from "@/components/ui";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  Loader2,
  ImageIcon,
  Armchair,
  Layout,
  Info,
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

// --- Helper: วาดผังรวมของทุกโซนต่อกันลงมา ---
const GlobalStadiumPreview = ({ zones }: { zones: any[] }) => {
  if (!zones || zones.length === 0) return null;
  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-zinc-950">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h3 className="text-white font-bold text-lg flex items-center gap-3">
          <Layout className="h-5 w-5 text-emerald-500" /> Layout Preview
        </h3>
        <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">
          Stage at top
        </span>
      </div>
      <CardContent className="p-12 flex flex-col items-center overflow-x-auto min-h-[300px]">
        <div className="w-full max-w-md mb-12 h-3 bg-zinc-800 rounded-b-3xl flex items-center justify-center border-x border-b border-zinc-700">
          <span className="text-[8px] font-black text-zinc-600 tracking-[1em] ml-[1em]">
            STAGE
          </span>
        </div>
        <div className="flex flex-col items-center gap-8 w-full">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 w-full animate-in fade-in slide-in-from-top-4"
            >
              <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-emerald-500 uppercase italic">
                {zone.name || `ZONE ${idx + 1}`}
              </span>
              <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 flex flex-col items-center gap-1">
                {zone.type === "standing" ? (
                  <div className="w-40 h-10 rounded-lg border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center">
                    <span className="text-[7px] text-indigo-400 font-bold tracking-widest uppercase">
                      Standing Area
                    </span>
                  </div>
                ) : (
                  Array.from({
                    length: Math.min(Number(zone.rows) || 0, 8),
                  }).map((_, rIdx) => (
                    <div key={rIdx} className="flex gap-1">
                      {Array.from({
                        length: Math.min(Number(zone.seatsPerRow) || 0, 25),
                      }).map((_, sIdx) => (
                        <div
                          key={sIdx}
                          className="w-1 h-1 rounded-full bg-emerald-500/20"
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

// --- Helper: วาดผังย่อยในแต่ละ Card ---
const SeatMapPreview = ({ zone }: { zone: any }) => {
  if (!zone) return null;
  const rows = Math.min(Number(zone.rows) || 0, 26);
  const seatsPerRow = Math.min(Number(zone.seatsPerRow) || 0, 50);
  return (
    <div className="relative w-full bg-zinc-950 rounded-2xl p-6 overflow-x-auto shadow-2xl border border-zinc-800">
      <div className="min-w-max flex flex-col items-center gap-1.5">
        {zone.type === "standing" ? (
          <div className="py-10 text-center uppercase font-black text-indigo-500 text-[10px] tracking-widest">
            Standing Field
          </div>
        ) : rows > 0 && seatsPerRow > 0 ? (
          Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-zinc-700 w-3">
                {String.fromCharCode(65 + rIdx)}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: seatsPerRow }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    title={`${String.fromCharCode(65 + rIdx)}${sIdx + 1}`}
                    className="w-1.5 h-1.5 rounded-[1px] bg-indigo-500/40 border border-indigo-500/20 hover:bg-emerald-400 transition-all"
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-zinc-700 text-[10px] uppercase font-bold tracking-widest text-center italic">
            Waiting for config...
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
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
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (id) fetchEvent(Array.isArray(id) ? id[0] : id);
  }, [id, fetchEvent]);

  useEffect(() => {
    if (currentEvent) {
      const date = new Date(currentEvent.date);
      reset({
        ...currentEvent,
        date: date.toISOString().slice(0, 16),
        description: currentEvent.description || "",
      });
      setIsFetching(false);
    }
  }, [currentEvent, reset]);

  // 🎯 Auto Capacity Calculation
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
    const eventId = Array.isArray(id) ? id[0] : id;

    try {
      let finalImageUrl = data.imageUrl;
      if (selectedFile) {
        finalImageUrl = await uploadService.uploadImage(selectedFile, eventId);
      }

      // Logic check: ถ้าเปลี่ยนขนาดที่นั่ง ต้องแจ้งเตือน
      let seats = undefined;
      const seatedZonesChanged =
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

      if (seatedZonesChanged) {
        if (
          confirm(
            "Changing zones or dimensions will regenerate all seat numbers. Continue?",
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

      if (await updateEvent(eventId, formattedData)) {
        toast.success("Event updated successfully");
        router.push("/admin");
      }
    } catch (error) {
      toast.error("Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center text-zinc-500 hover:text-indigo-600 font-bold transition-all group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
          BACK
        </Link>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">
          EDIT EVENT
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden">
          <div className="h-3 bg-indigo-600" />
          <CardContent className="p-10 space-y-10">
            <div className="relative h-80 rounded-[35px] border-4 border-dashed border-zinc-100 bg-zinc-50 overflow-hidden flex items-center justify-center transition-all hover:border-indigo-200">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  alt="Banner"
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-zinc-200" />
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
                  Title
                </label>
                <Input
                  {...register("title", { required: true })}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase">
                  Date & Time
                </label>
                <Input
                  type="datetime-local"
                  {...register("date", { required: true })}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase">
                Location
              </label>
              <Input
                {...register("location", { required: true })}
                className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden">
          <div className="h-3 bg-emerald-500" />
          <CardHeader className="pt-10 px-10 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-black tracking-tighter">
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
              className="bg-black text-white hover:bg-zinc-800 rounded-2xl px-8 h-12 font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> ADD ZONE
            </Button>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-10 rounded-[40px] border border-zinc-100 bg-white hover:border-indigo-200 transition-all group relative"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-6 right-6 h-10 w-10 bg-zinc-50 text-zinc-300 hover:text-red-500 rounded-full flex items-center justify-center transition-all"
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
                        className="h-12 rounded-xl border-zinc-100 bg-zinc-50/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Type
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
                    {watchZones?.[index]?.type === "seated" && (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-400">
                            Rows
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.rows`)}
                            className="rounded-xl border-indigo-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-400">
                            Seats/Row
                          </label>
                          <Input
                            type="number"
                            {...register(`zones.${index}.seatsPerRow`)}
                            className="rounded-xl border-indigo-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-7">
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

        <div className="flex items-center justify-end gap-6 pb-24">
          <Button
            type="button"
            onClick={() => router.back()}
            className="text-zinc-400 font-bold hover:text-black"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-20 px-16 bg-zinc-900 hover:bg-black text-white rounded-[30px] font-black text-xl shadow-2xl transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin mr-3" /> : null}{" "}
            UPDATE EVENT
          </Button>
        </div>
      </form>
    </div>
  );
}
