'use client'

import { useEffect, useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import StripePaymentForm from '@/components/client/payment/StripePaymentForm';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function PayPage() {
    const router = useRouter();
    const { id: orderId } = useParams();
    const { resolvedTheme } = useTheme();

    const [stripePromise, setStripePromise] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [devHint, setDevHint] = useState(null);
    const [loading, setLoading] = useState(true);

    const isDark = resolvedTheme === 'dark';

    const initCheckout = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDevHint(null);

        try {
            // 1. Fetch Order Details from DB
            const orderRes = await fetch(`/api/orders/${orderId}`);
            if (!orderRes.ok) {
                const orderErr = await orderRes.json().catch(() => ({}));
                throw new Error(orderErr.error || 'We could not find this order. It may have already been cancelled.');
            }
            const orderData = await orderRes.json();
            setOrder(orderData);

            if (orderData.status !== 'PENDING') {
                router.push('/orders');
                return;
            }

            // 2. Fetch Payment Client Secret & Publishable Key from Backend
            const paymentRes = await fetch('/api/payment/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            });

            const data = await paymentRes.json();
            if (!paymentRes.ok) {
                throw new Error(data.error || 'Payment service is temporarily unavailable. Please try again later.');
            }

            const publishableKey = data.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

            if (!publishableKey || typeof publishableKey !== 'string') {
                console.error('[Stripe Config Error]: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured in .env or Vercel environment variables.');
                setDevHint('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing in your .env or Vercel environment variables.');
                throw new Error('We are having trouble connecting to our payment provider right now. Please try again in a few moments.');
            }

            setStripePromise(loadStripe(publishableKey));
            setClientSecret(data.clientSecret);
        } catch (err) {
            setError(err.message || 'Unable to load payment details.');
        } finally {
            setLoading(false);
        }
    }, [orderId, router]);

    useEffect(() => {
        if (orderId) initCheckout();
    }, [orderId, initCheckout]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
                <p className="mt-4 text-sm font-bold text-[var(--bakery-text-muted)]">Loading Secure Checkout...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-lg text-center py-16 px-6">
                <div className="rounded-[2.5rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl shadow-amber-900/5">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400">
                        <AlertCircle size={32} />
                    </div>

                    <h2 className="text-2xl font-black text-[var(--bakery-text)] mb-3">
                        Payment Temporarily Unavailable
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--bakery-text-muted)] mb-8">
                        {error || 'We are having trouble preparing your payment at this moment. Please try again or check your orders.'}
                    </p>

                    {devHint && process.env.NODE_ENV === 'development' && (
                        <div className="mb-6 rounded-xl border border-amber-200 dark:border-zinc-700 bg-amber-50/50 dark:bg-zinc-800/60 p-3.5 text-left text-xs font-mono text-amber-800 dark:text-amber-300">
                            <span className="font-bold">🔧 Dev Hint:</span> {devHint}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={initCheckout}
                            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                        <Link
                            href="/orders"
                            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3.5 text-sm font-black text-[var(--bakery-text)] transition-all hover:bg-amber-50 dark:hover:bg-zinc-700"
                        >
                            <ShoppingBag size={16} />
                            View Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const stripeAppearance = {
        theme: isDark ? 'night' : 'stripe',
        variables: {
            colorPrimary: '#d97706', // amber-600
            colorBackground: isDark ? '#18181b' : '#ffffff', // zinc-900 vs white
            colorText: isDark ? '#f4f4f5' : '#1c1917', // zinc-100 vs stone-900
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '16px',
        },
        rules: {
            '.Input': {
                border: isDark ? '1px solid #3f3f46' : '1px solid #e7e5e4',
                boxShadow: 'none',
            },
            '.Input:focus': {
                border: '1px solid #d97706',
                boxShadow: '0 0 0 2px #fde68a',
            },
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <Link href="/cart" className="mb-6 flex w-fit items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">
                <ChevronLeft size={14} />
                Back to Cart
            </Link>

            <h1 className="text-3xl font-extrabold text-[var(--bakery-text)] mb-8">Secure Checkout</h1>

            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
                {/* Left Side: Stripe Payment Element Form */}
                <div className="rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl">
                    <h2 className="text-lg font-bold text-[var(--bakery-text)] mb-4">Payment Method</h2>
                    {clientSecret && stripePromise ? (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                            <StripePaymentForm orderId={orderId} />
                        </Elements>
                    ) : (
                        <p className="text-xs text-red-500">Failed to load payment options.</p>
                    )}
                </div>

                {/* Right Side: Order details breakdown */}
                <div className="rounded-[2rem] border border-amber-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 h-fit shadow-xl">
                    <h2 className="text-lg font-bold text-[var(--bakery-text)] mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs text-[var(--bakery-text-muted)]">
                            <span>Order ID</span>
                            <span className="font-mono font-bold text-[var(--bakery-text)]">#{orderId.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[var(--bakery-text-muted)]">
                            <span>Delivery Address</span>
                            <span className="font-bold text-[var(--bakery-text)] text-right max-w-[150px] truncate">{order.address}</span>
                        </div>

                        {/* Order Items Breakdown */}
                        <div className="border-t border-amber-50 dark:border-zinc-800 pt-4 space-y-3">
                            <h3 className="text-[10px] font-black text-[var(--bakery-text-muted)] uppercase tracking-wider">Items</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[var(--bakery-text)]">{item.product?.name}</span>
                                            <span className="text-[var(--bakery-text-muted)] font-bold">x{item.quantity}</span>
                                        </div>
                                        <span className="font-medium text-amber-700 dark:text-amber-400">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-amber-50 dark:border-zinc-800 pt-4 flex justify-between items-center">
                            <span className="text-sm font-bold text-[var(--bakery-text)]">Total Amount</span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-500">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}