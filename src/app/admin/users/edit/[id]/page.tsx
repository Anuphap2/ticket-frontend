"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { Card, Input, Button } from "@/components/ui";
import { 
  ChevronLeft, 
  Save, 
  Shield, 
  Mail, 
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(id as string);
        setFormData(data);
      } catch (error) {
        toast.error("FAILED TO FETCH USER IDENTITY");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.update(id as string, formData);
      toast.success("Update successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error("Update failed, please try again");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
    </div>
  );

  return (
    <div className="space-y-8 p-8 bg-zinc-50/50 min-h-screen antialiased">
      {/* Header Section */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter italic uppercase">
              Edit Identity
            </h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Modifying Node: {id?.slice(-8)}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.04)] p-10 rounded-[2.5rem] bg-white space-y-8">
          
          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">First Name</label>
              <Input 
                value={formData.firstName || ""}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="h-14 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-zinc-900/5 transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Last Name</label>
              <Input 
                value={formData.lastName || ""}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="h-14 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-zinc-900/5 transition-all"
                required
              />
            </div>
          </div>

          {/* Section: Contact & Role */}
          <div className="space-y-6 pt-4 border-t border-zinc-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                  <Input 
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-12 h-14 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-zinc-900/5 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Hierarchy Role</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full pl-12 h-14 bg-zinc-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-zinc-900/5 appearance-none transition-all"
                  >
                    <option value="user">USER (STANDARD)</option>
                    <option value="admin">ADMIN (PRIVILEGED)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button 
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="h-14 px-10 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              Commit Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}