'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/auth/signup', data);
      alert('สมัครสมาชิกสำเร็จ!');
      router.push('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-black">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-6">สร้างบัญชีใหม่</h2>
        <div className="space-y-4">
          <input {...register('email')} type="email" placeholder="Email" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          <input {...register('password')} type="password" placeholder="Password" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">สมัครสมาชิก</button>
        </div>
      </form>
    </div>
  );
}