'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post('/auth/signin', data);
      const { access_token } = res.data;

      localStorage.setItem('access_token', access_token);
      
      const decoded: any = jwtDecode(access_token);
      
      // แยกหน้าตาม Role ที่เราทำไว้ใน NestJS
      if (decoded.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err) {
      alert('Email หรือ Password ไม่ถูกต้อง');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">ยินดีต้อนรับ</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-black">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              {...register('email', { required: true })}
              type="email" 
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              {...register('password', { required: true })}
              type="password" 
              className="w-full mt-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}