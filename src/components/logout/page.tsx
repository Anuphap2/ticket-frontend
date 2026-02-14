'use client';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. เรียก API Logout ที่หลังบ้าน (ถ้าพู่กันทำระบบ Revoke Token ไว้)
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 2. เคลียร์ Token ในเครื่องพู่กัน
      localStorage.removeItem('access_token');
      
      // 3. ดีดกลับไปหน้า Login
      router.push('/login');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
    >
      ออกจากระบบ
    </button>
  );
}