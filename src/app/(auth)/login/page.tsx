"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button, Input, CardContent, CardFooter } from "@/components/ui";
import { User, Shield, Sparkles, ArrowLeft } from "lucide-react";
import gsap from "gsap";

type LoginFormData = {
  email: string;
  password: string;
};

function LoginContent() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  const {
    register,
    handleSubmit,
    setValue,
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
      if (userData?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    onSubmit({ email, password: pass });
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
        opacity: 0,
        duration: 0.8,
      });

      // Stagger content
      tl.from(
        ".animate-item",
        {
          opacity: 0,
          y: 20,
          duration: 0.4,
          stagger: 0.1,
        },
        "-=0.4",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen items-center justify-center bg-gray-50 lg:p-8 overflow-hidden"
    >
      <div className="flex h-full w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Left Side */}
        <div className="flex w-full flex-col lg:w-2/5 overflow-y-auto">
          <div
            ref={formWrapperRef}
            className="flex flex-col min-h-full justify-between"
          >
            <CardContent className="p-8 lg:p-12 space-y-6">
              <div className="animate-item">
                <Link
                  href="/"
                  className="inline-flex gap-2 mb-4 items-center px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Home
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to book concert tickets or explore the system.
                </p>
              </div>

              {/* ⚡ One-Click Portfolio Demo Section */}
              <div className="animate-item p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Portfolio Demo Mode
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                    1-Click Login
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("user@demo.com", "demo123")}
                    disabled={isLoading}
                    className="py-2.5 px-3 text-xs font-bold text-zinc-800 bg-white border border-indigo-200/80 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-600 transition-all text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    Demo User
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@demo.com", "admin123")}
                    disabled={isLoading}
                    className="py-2.5 px-3 text-xs font-bold text-zinc-800 bg-white border border-purple-200/80 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:text-purple-600 transition-all text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    Demo Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <section className="space-y-4 animate-item">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@company.com"
                      error={errors.email?.message}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email format",
                        },
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="animate-item w-full py-5 text-sm font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="p-6 text-center animate-item border-t border-zinc-100">
              <p className="w-full text-xs text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Register here
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <h2 className="mb-4 text-4xl lg:text-5xl font-black leading-tight tracking-tight animate-item">
              Concert Ticket Booking
            </h2>
            <p className="max-w-md text-base font-medium text-gray-300 animate-item leading-relaxed">
              Experience the High Concurrency Architecture featuring FIFO Queueing, Atomic Stock Updates, and Interactive Seating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
