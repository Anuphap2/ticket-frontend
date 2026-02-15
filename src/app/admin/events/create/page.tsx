'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useEvents } from '@/hooks/useEvents';
import { uploadService } from '@/services/uploadService';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { Plus, Trash2, ArrowLeft, Upload, Loader2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { generateSeats } from '@/utils/seatUtils';

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { createEvent } = useEvents();
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      imageUrl: '',
      type: 'standing',
      rows: 10,
      seatsPerRow: 20,
      zones: [{ name: '', price: 0, totalSeats: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'zones'
  });

  const imageUrl = watch('imageUrl');

  // Create a preview URL when file is selected
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setValue('imageUrl', previewUrl);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let finalImageUrl = '';

      // Upload image if a new file is selected
      if (selectedFile) {
        try {
          finalImageUrl = await uploadService.uploadImage(selectedFile);
        } catch (error: any) {
          console.error('Upload error:', error);
          const message = error.response?.data?.message || 'Failed to upload image';
          toast.error(message);
          setIsLoading(false);
          return; // Stop submission if upload fails
        }
      }

      // Ensure number types
      const rows = Number(data.rows);
      const seatsPerRow = Number(data.seatsPerRow);

      const formattedData = {
        ...data,
        rows,
        seatsPerRow,
        imageUrl: finalImageUrl, // Use the uploaded URL
        zones: data.zones.map((z: any) => ({
          ...z,
          price: Number(z.price),
          totalSeats: Number(z.totalSeats)
        })),
        // Generate seats if type is seated
        seats: data.type === 'seated' ? generateSeats(rows, seatsPerRow) : []
      };

      const success = await createEvent(formattedData);
      if (success) {
        router.push('/admin');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create Event</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-zinc-700">Event Image</label>

              <div className="flex items-center gap-6">
                <div className="relative h-40 w-64 flex-shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-zinc-500">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-sm text-zinc-500">
                    Upload a cover image for your event. Recommended size: 1200x600px.
                  </p>
                  <Button type="button" variant="outline" className="relative">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Taylor Swift Concert" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data & Time</label>
                <Input type="datetime-local" {...register('date', { required: 'Date is required' })} />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message as string}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input {...register('location', { required: 'Location is required' })} placeholder="e.g. Rajamangala Stadium" />
              {errors.location && <p className="text-xs text-red-500">{errors.location.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                className="w-full min-h-[120px] rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Details about the event..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Zones & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Type Selection */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h3 className="text-lg font-medium">Event Type</h3>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-zinc-50">
                  <input type="radio" value="standing" {...register('type')} className="h-4 w-4 text-indigo-600" />
                  <div>
                    <span className="block font-medium">Standing / General Admission</span>
                    <span className="text-xs text-zinc-500">First come, first served. No specific seat assignment.</span>
                  </div>
                </label>
                <label className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-zinc-50">
                  <input type="radio" value="seated" {...register('type')} className="h-4 w-4 text-indigo-600" />
                  <div>
                    <span className="block font-medium">Seated</span>
                    <span className="text-xs text-zinc-500">Attendees select specific seats (e.g., A1, A2).</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Seat Configuration (only if seated) */}
            {watch('type') === 'seated' && (
              <div className="grid gap-6 md:grid-cols-2 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-indigo-900">Rows</label>
                  <Input
                    type="number"
                    {...register('rows')}
                    className="bg-white"
                    min={1}
                  />
                  <p className="text-xs text-indigo-600">Number of rows (A, B, C...)</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-indigo-900">Seats per Row</label>
                  <Input
                    type="number"
                    {...register('seatsPerRow')}
                    className="bg-white"
                    min={1}
                  />
                  <p className="text-xs text-indigo-600">Number of seats in each row</p>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium text-indigo-900 mb-2">Preview</div>
                  <div className="bg-white p-4 rounded border border-indigo-200 text-center text-zinc-400 text-sm">
                    {watch('rows')} rows x {watch('seatsPerRow')} seats = <span className="font-bold text-indigo-600">{Number(watch('rows')) * Number(watch('seatsPerRow'))} Total Seats</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Zones</label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0, totalSeats: 0 })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Zone
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end p-4 bg-zinc-50 rounded-lg relative group">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium">Zone Name</label>
                    <Input {...register(`zones.${index}.name` as const, { required: true })} placeholder="e.g. VIP, Zone A" />
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-xs font-medium">Price</label>
                    <Input type="number" {...register(`zones.${index}.price` as const, { required: true, min: 0 })} />
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-xs font-medium">Capacity</label>
                    <Input type="number" {...register(`zones.${index}.totalSeats` as const, { required: true, min: 1 })} />
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t border-zinc-100 pt-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Event
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}