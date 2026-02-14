"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/axios";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post("/auth/signin", data);
      const { access_token } = res.data;

      localStorage.setItem("access_token", access_token);

      const decoded: any = jwtDecode(access_token);

      // แยกทางตาม Role
      if (decoded.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/home");
      }
    } catch (err) {
      alert("Email หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border"
      >
        <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
        <div className="space-y-4">
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
