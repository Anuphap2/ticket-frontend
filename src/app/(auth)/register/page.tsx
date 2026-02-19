"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button, Input, CardContent, CardFooter } from "@/components/ui";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type RegisterFormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
};

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await authService.register(data);
      const { access_token, refresh_token } = response;
      const user = await authService.getProfile(access_token);

      login(access_token, refresh_token, user);
      toast.success("Welcome to Pookan Tickets!", { id: toastId });
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Left panel
      tl.from(formRef.current, {
        x: -80,
        opacity: 0,
        duration: 1,
      });

      // Right panel
      tl.from(
        imageRef.current,
        {
          x: 80,
          opacity: 0,
          duration: 1,
        },
        "-=0.8",
      );

      // Stagger inner content
      tl.from(
        ".animate-item",
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
        },
        "-=0.6",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen items-center justify-center bg-gray-50 lg:p-8"
    >
      <div className="flex h-full w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Left Side: Form */}
        <div
          ref={formRef}
          className="flex w-full flex-col overflow-y-hidden lg:w-2/5"
        >
          <CardContent className="grow p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8 animate-item">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Create Account
              </h1>
              <p className="text-gray-500">
                Please fill in your information to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Information */}
              <section className="space-y-4 animate-item">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    error={errors.email?.message}
                    {...register("email", {
                      required: "Email is required",
                    })}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="At least 8 characters"
                    error={errors.password?.message}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                </div>
              </section>

              <hr className="border-gray-100 animate-item" />

              {/* Personal Identity */}
              <section className="space-y-4 animate-item">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Personal Identity
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                  <Input
                    label="Last Name"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                  <Input
                    label="Phone Number"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <Input
                    label="National ID"
                    type="password"
                    error={errors.nationalId?.message}
                    {...register("nationalId")}
                  />
                </div>
              </section>

              <Button
                type="submit"
                disabled={isLoading}
                className="animate-item w-full py-6 text-base font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-[0.98]"
              >
                {isLoading ? "Creating..." : "Register Now"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t bg-gray-50 p-6 text-center animate-item">
            <p className="w-full text-sm text-gray-600">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </div>

        {/* Right Side: Image Panel */}
        <div ref={imageRef} className="relative hidden w-3/4 md:block">
          <div
            className="absolute inset-0 bg-[url('/login_page_picture.png')] bg-cover bg-center"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <h2 className="mb-4 text-5xl font-bold leading-tight animate-item">
              Join us
            </h2>
            <p className="max-w-md text-xl font-light text-gray-200 animate-item">
              Discover the rhythm of your soul. Experience live music like never
              before with Ticket App.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
