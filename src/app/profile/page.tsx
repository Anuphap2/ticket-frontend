'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from "next/link";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 👉 interceptor คืน response.data มาแล้ว
        const res = await api.get('/auth/profile');

        // res = { success: true, data: user }
        setUser(res.data);
      } catch (err) {
        console.error('❌ fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>ไม่พบข้อมูลผู้ใช้</div>;

  return (
  <div className="p-6 text-white">
    <h1 className="text-2xl font-bold mb-4">Profile</h1>

    <p>Email: {user.email}</p>
    <p>First name: {user.firstName}</p>
    <p>Last name: {user.lastName}</p>
    <p>Phone: {user.phone}</p>
    <p>Role: {user.role}</p>

    <Link
  href="/profile/edit"
  className="p-2 px-4 border rounded-full border-zinc-700 text-zinc-700 transition-all duration-500 
    ease-out hover:border-black hover:text-black hover:scale-105 hover:shadow-lg hover:bg-zinc-200 
    inline-block
  "
>
  แก้ไขข้อมูล
</Link>

  </div>
);
}
