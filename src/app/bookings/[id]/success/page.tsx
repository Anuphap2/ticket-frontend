'use client';
import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SuccessPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Stripe จะส่ง payment_intent_client_secret มาใน URL
    const paymentStatus = searchParams.get('redirect_status');

    useEffect(() => {
        const confirmPayment = async () => {
            if (paymentStatus === 'succeeded' && id) {
                try {
                    const token = localStorage.getItem('accessToken');
                    // ยิงไปบอก Backend ว่า "คนนี้จ่ายจริงนะ Stripe ยืนยันมาแล้ว"
                    await axios.patch(`http://localhost:3000/bookings/${id}/confirm`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('ชำระเงินสำเร็จ ระบบอัปเดตสถานะแล้ว!');
                } catch (err) {
                    toast.error('อัปเดตสถานะไม่สำเร็จ กรุณาติดต่อแอดมิน');
                }
            }
        };

        confirmPayment();
    }, [id, paymentStatus]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-green-600">ชำระเงินเสร็จสมบูรณ์!</h1>
            <p className="mt-2 text-zinc-600">กำลังพาคุณกลับไปที่หน้าตั๋วของคุณ...</p>
            <button
                onClick={() => router.push('/my-bookings')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
                ดูตั๋วทั้งหมด
            </button>
        </div>
    );
}