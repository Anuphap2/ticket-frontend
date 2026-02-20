"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { User } from "@/types";
import gsap from "gsap";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import toast from "react-hot-toast";

// สร้าง Interface สำหรับ Component InputGroup เพื่อเลี่ยงการใช้ any
interface InputGroupProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: React.Dispatch<React.SetStateAction<Partial<User>>>;
  type?: string;
  placeholder?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<User>>({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authService
      .getProfile()
      .then((user) =>
        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
      );
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      await authService.updateProfile(form);
      toast.success("Profile updated successfully!", { id: toastId });
      router.push("/profile");
      router.refresh();
    } catch {
      toast.error("Failed to update profile", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-6 antialiased">
      <div className="max-w-xl mx-auto">
        {/* Top Navigation */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft
            size={14}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>

        {/* 3. ผูก Ref และใส่ opacity-0 ซ่อนไว้ก่อน */}
        <div
          ref={cardRef}
          className="opacity-0 bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.04)] border border-zinc-100 overflow-hidden"
        >
          {/* Header Area */}
          <div className="bg-zinc-950 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                <UserIcon size={24} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                  Edit Identity
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                  Keep your information up to date
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={setForm}
              />
              <InputGroup
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={setForm}
              />
            </div>

            <InputGroup
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={setForm}
              type="tel"
              placeholder="08X-XXX-XXXX"
            />

            <div className="pt-4">
              <button
                disabled={saving}
                className="w-full h-16 bg-zinc-900 text-white rounded-[22px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3 shadow-xl shadow-zinc-200"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Confirm Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Note */}
        <p className="mt-8 text-center text-[10px] text-zinc-300 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <Sparkles size={12} /> Secure Profile Management
        </p>
      </div>
    </div>
  );
}

// Reusable Component เพื่อความคลีน (พร้อม Type ที่ถูกต้อง)
function InputGroup({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, [name]: e.target.value }))
        }
        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-zinc-900"
      />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">
        ACCESSING IDENTITY VAULT...
      </p>
    </div>
  );
}
