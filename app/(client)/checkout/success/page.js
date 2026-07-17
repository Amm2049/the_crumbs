'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown === 0) {
            router.push('/orders');
        }
    }, [countdown, router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-2xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/30 text-green-500 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-black text-[var(--bakery-text)] mb-3">Order Paid Successfully!</h1>
                <p className="text-sm text-[var(--bakery-text-muted)] mb-8 leading-relaxed">
                    Thank you for your order {orderId ? `(#${orderId.slice(0, 8).toUpperCase()})` : ''}! We&apos;ve received your payment, and our bakers are preparing your items.
                </p>

                <div className="rounded-2xl bg-amber-50/40 dark:bg-zinc-850/40 p-4 mb-6">
                    <p className="text-xs text-[var(--bakery-text-muted)] font-medium">
                        Redirecting to your Order History in <span className="font-bold text-amber-600 dark:text-amber-500">{countdown}</span> seconds...
                    </p>
                </div>

                <Link href="/orders" className="inline-flex w-full justify-center rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors">
                    Go to Orders Now
                </Link>
            </div>
        </div>
    );
}