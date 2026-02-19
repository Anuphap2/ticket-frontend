"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { Lock, Mail, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // 🎯 ดักจับกรณีโดนเตะออกจากระบบ (Interceptor)
  useEffect(() => {
    if (isExpired) {
      toast.error("Session expired. Please login again.", {
        id: "auth-expired",
      });
    }
  }, [isExpired]);

  const onSubmit = async (data: any) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6 antialiased">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.08)] rounded-[45px] overflow-hidden bg-white">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

          <CardHeader className="pt-12 pb-8 px-10">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center rotate-3 shadow-lg">
                <Sparkles className="text-indigo-400 h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-center tracking-tighter italic uppercase text-zinc-900">
              Sign In
            </CardTitle>
            <p className="text-center text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">
              To your pookan account
            </p>
          </CardHeader>

          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-medium"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2 uppercase italic">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="h-14 pl-12 rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-medium"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  {errors.password && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 ml-2 uppercase italic">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-[22px] bg-zinc-900 text-white font-black text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <span className="flex items-center gap-2">
                    LOGIN{" "}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-zinc-50/80 border-t border-zinc-100 py-8 flex justify-center">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-800 transition-colors ml-1"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Branding footer */}
        <p className="mt-8 text-center text-[10px] text-zinc-300 font-bold uppercase tracking-[0.3em]">
          Powered by Pookan Dev &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
