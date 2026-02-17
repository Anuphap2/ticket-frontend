'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            console.log("Registering with data:", data);
            const response = await authService.register(data);
            console.log("Register response:", response);
            const { access_token, refresh_token } = response;

            // We need to fetch user profile to get role and details
            const user = await authService.getProfile(access_token);

            login(access_token, refresh_token, user);
            toast.success('Registration successful!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Email address"
                                error={errors.email?.message as string}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Password (min 8 characters)"
                                error={errors.password?.message as string}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    }
                                })}
                            />
                        </div>
                        <div className="space-y-2">
    <Input
      label="First Name"
      placeholder="ชื่อจริง"
      error={errors.firstName?.message as string}
      {...register('firstName', {
        required: 'First name is required',
      })}
    />
  </div>

  <div className="space-y-2">
    <Input
      label="Last Name"
      placeholder="นามสกุล"
      error={errors.lastName?.message as string}
      {...register('lastName', {
        required: 'Last name is required',
      })}
    />
  </div>

  <div className="space-y-2">
    <Input
      label="Phone"
      placeholder="0812345678"
      error={errors.phone?.message as string}
      {...register('phone', {
        required: 'Phone is required',
        pattern: {
          value: /^0[0-9]{9}$/,
          message: 'Phone must be 10 digits',
        },
      })}
    />
  </div>

  <div className="space-y-2">
    <Input
      label="National ID"
      type="password"
      placeholder="เลขบัตรประชาชน 13 หลัก"
      error={errors.nationalId?.message as string}
      {...register('nationalId', {
        required: 'National ID is required',
        pattern: {
          value: /^[0-9]{13}$/,
          message: 'National ID must be 13 digits',
        },
      })}
    />
  </div>
<Button type="submit" className="w-full" isLoading={isLoading}>
                            Register
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-zinc-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Login here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
