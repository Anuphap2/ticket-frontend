'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useEvents } from '@/hooks/useEvents';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
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

    const { updateEvent, fetchEvent, currentEvent } = useEvents();

    useEffect(() => {
        if (id) {
            fetchEvent(Array.isArray(id) ? id[0] : id);
        }
    }, [id, fetchEvent]);

    useEffect(() => {
        if (currentEvent) {
            const date = new Date(currentEvent.date);
            const formattedDate = date.toISOString().slice(0, 16);
            reset({
                title: currentEvent.title,
                description: currentEvent.description || '',
                date: formattedDate,
                location: currentEvent.location,
                zones: currentEvent.zones
            });
            setIsFetching(false);
        }
    }, [currentEvent, reset]);


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

            const eventId = Array.isArray(id) ? id[0] : id;
            if (!eventId) return;
            const success = await updateEvent(eventId, formattedData);
            if (success) {
                router.push('/admin');
            }
        } catch (error) {
            console.error(error);
            toast.error((error as any).response?.data?.message || 'Failed to update event');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Event</CardTitle>
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
                            <Button type="submit" isLoading={isLoading} size="lg">Update Event</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
