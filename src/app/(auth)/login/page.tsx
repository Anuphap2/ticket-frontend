"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button, Input, CardContent, CardFooter } from "@/components/ui";
import gsap from "gsap";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isExpired) {
      toast.error("Session expired. Please login again.", {
        id: "auth-expired",
      });
    }
  }, [isExpired]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const toastId = toast.loading("Authenticating...");

    try {
      const loginRes = await authService.login(data);
      const { access_token, refresh_token } = loginRes;

      const userData = await authService.getProfile(access_token);

      login(access_token, refresh_token, userData);
      toast.success("Welcome back!", { id: toastId });
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Left panel slide in
      tl.from(formWrapperRef.current, {
        x: -80,
        opacity: 0,
        duration: 1,
      });

      // Stagger content
      tl.from(
        ".animate-item",
        {
          y: 30,
          opacity: 0,
          duration: 0.5,
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
      className="flex h-screen w-screen items-center justify-center bg-gray-50 lg:p-8 overflow-hidden"
    >
      <div className="flex h-full w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Left Side */}
        <div className="flex w-full flex-col lg:w-2/5 overflow-hidden">
          {/* Animated Wrapper (Prevents Scrollbar Bug) */}
          <div
            ref={formWrapperRef}
            className="flex flex-col h-full overflow-y-hidden"
          >
            <CardContent className="grow p-8 lg:p-12">
              <div className="mb-8 animate-item">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-gray-500">
                  Sign in to continue to your account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <section className="space-y-4 animate-item">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Account Access
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
                      placeholder="Enter your password"
                      error={errors.password?.message}
                      {...register("password", {
                        required: "Password is required",
                      })}
                    />
                  </div>
                </section>

                <div className="flex justify-end animate-item">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="animate-item w-full py-6 text-base font-bold uppercase tracking-widest shadow-lg transition-transform active:scale-[0.98]"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="border-t bg-gray-50 p-6 text-center animate-item">
              <p className="w-full text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create one here
                </Link>
              </p>
            </CardFooter>
          </div>
        </div>

        {/* Right Side */}
        <div ref={imageRef} className="relative hidden w-3/4 md:block">
          <div
            className="absolute inset-0 bg-[url('/login_page_picture.png')] bg-cover bg-center"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <h2 className="mb-4 text-5xl font-bold leading-tight animate-item">
              Feel the Energy
            </h2>
            <p className="max-w-md text-xl font-light text-gray-200 animate-item">
              Experience unforgettable live moments. Secure your tickets and be
              part of something extraordinary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
