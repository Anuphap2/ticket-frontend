'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/logout/page';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login'); // ถ้าไม่มี Token ให้ไล่กลับไปหน้า Login ทันที
    }
  }, [router]);

  return (
    <div>
      <h1>ยินดีต้อนรับ Admin พู่กัน!</h1>
      <LogoutButton />
    </div>
  );
}