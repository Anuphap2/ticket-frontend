'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const { access_token, refresh_token } = await authService.login(data);

            // We need to fetch user profile to get role and details
            const user = await authService.getProfile(access_token);

            login(access_token, refresh_token, user);
            toast.success('Login successful!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Email address"
                                error={errors.email?.message as string}
                                {...register('email', { required: 'Email is required' })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Password"
                                error={errors.password?.message as string}
                                {...register('password', { required: 'Password is required' })}
                            />
                        </div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Login
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-zinc-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Register here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
