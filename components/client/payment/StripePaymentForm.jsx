'use client'

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ShoppingBag } from 'lucide-react';

export default function StripePaymentForm({ orderId }) {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(null);

        // Triggers confirmation of card or redirection for QR/PromptPay code
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
            },
        });

        if (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-amber-50 dark:border-zinc-800 bg-amber-50/10 dark:bg-zinc-850/40 p-4">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold animate-shake">
                    {errorMessage}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-4 text-base font-black tracking-wide text-white shadow-xl shadow-amber-200 dark:shadow-amber-900/20 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:scale-100 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <span className="h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
                        <span>Processing Payment...</span>
                    </>
                ) : (
                    <>
                        <ShoppingBag size={18} />
                        <span>Pay & Complete Order</span>
                    </>
                )}
            </button>
        </form>
    );
}