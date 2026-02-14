'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useEvents } from '@/hooks/useEvents';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { createEvent } = useEvents();
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      zones: [{ name: '', price: 0, totalSeats: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'zones'
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Ensure number types
      const formattedData = {
        ...data,
        zones: data.zones.map((z: any) => ({
          ...z,
          price: Number(z.price),
          totalSeats: Number(z.totalSeats)
        }))
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
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Input label="Event Title" {...register('title', { required: 'Title is required' })} error={errors.title?.message as string} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...register('description')}
                />
              </div>
              <div className="space-y-2">
                <Input label="Date" type="datetime-local" {...register('date', { required: 'Date is required' })} error={errors.date?.message as string} />
              </div>
              <div className="space-y-2">
                <Input label="Location" {...register('location', { required: 'Location is required' })} error={errors.location?.message as string} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Zones</h3>
                <Button type="button" size="sm" variant="secondary" onClick={() => append({ name: '', price: 0, totalSeats: 0 })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Zone
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex-1 w-full">
                    <Input label="Zone Name" placeholder="e.g. VIP" {...register(`zones.${index}.name` as const, { required: true })} />
                  </div>
                  <div className="w-full sm:w-32">
                    <Input label="Price" type="number" min="0" {...register(`zones.${index}.price` as const, { required: true })} />
                  </div>
                  <div className="w-full sm:w-32">
                    <Input label="Seats" type="number" min="1" {...register(`zones.${index}.totalSeats` as const, { required: true })} />
                  </div>
                  <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => remove(index)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <Button type="submit" isLoading={isLoading} size="lg">Create Event</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}