"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      const response = await authService.register(data);
      const { access_token, refresh_token } = response;

      // Fetch user profile to get complete details
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6 antialiased">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="border-none shadow-[0_40px_120px_rgba(0,0,0,0.1)] rounded-[50px] overflow-hidden bg-white">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

          <CardHeader className="pt-12 pb-8 px-10">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center -rotate-3 shadow-lg">
                <Sparkles className="text-indigo-400 h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black text-center tracking-tighter italic uppercase text-zinc-900">
              Join Us
            </CardTitle>
            <p className="text-center text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">
              Start your journey with pookan
            </p>
          </CardHeader>

          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* --- Section: Account Details --- */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">
                  Account Information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-11 -translate-y-1/2 text-zinc-400 h-4 w-4 z-10" />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="email@example.com"
                      className="h-12 pl-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                      error={errors.email?.message as string}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email",
                        },
                      })}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-11 -translate-y-1/2 text-zinc-400 h-4 w-4 z-10" />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Min 8 chars"
                      className="h-12 pl-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                      error={errors.password?.message as string}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Min 8 chars" },
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* --- Section: Personal Details --- */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-1">
                  Personal Identity
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="ชื่อจริง"
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                    error={errors.firstName?.message as string}
                    {...register("firstName", { required: "Required" })}
                  />
                  <Input
                    label="Last Name"
                    placeholder="นามสกุล"
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                    error={errors.lastName?.message as string}
                    {...register("lastName", { required: "Required" })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-11 -translate-y-1/2 text-zinc-400 h-4 w-4 z-10" />
                    <Input
                      label="Phone"
                      placeholder="08xxxxxxxx"
                      className="h-12 pl-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                      error={errors.phone?.message as string}
                      {...register("phone", {
                        required: "Required",
                        pattern: { value: /^0[0-9]{9}$/, message: "10 digits" },
                      })}
                    />
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-11 -translate-y-1/2 text-zinc-400 h-4 w-4 z-10" />
                    <Input
                      label="National ID"
                      type="password"
                      placeholder="13-digit ID"
                      className="h-12 pl-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-sm"
                      error={errors.nationalId?.message as string}
                      {...register("nationalId", {
                        required: "Required",
                        pattern: { value: /^[0-9]{13}$/, message: "13 digits" },
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-[22px] bg-zinc-900 text-white font-black text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98] group mt-4"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <span className="flex items-center gap-2">
                    CREATE ACCOUNT{" "}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-zinc-50/80 border-t border-zinc-100 py-8 flex justify-center">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Already a member?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-800 transition-colors ml-1"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-[10px] text-zinc-300 font-bold uppercase tracking-[0.3em]">
          Secured Registration System &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
