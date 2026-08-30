import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { APP_CONFIG } from '@/lib/config';
import { response } from '@/lib/api-helper';

export async function POST(request) {
    try {
        const session = await auth()
        if (!session) return response({ error: 'Unauthorized' }, 401)

        const secretKey = process.env.STRIPE_SECRET_KEY
        if (!secretKey) {
            console.error('[Stripe Config Error]: STRIPE_SECRET_KEY is missing from environment variables.')
            return response({ error: 'Payment service is temporarily unavailable. Please try again later.' }, 500)
        }

        const stripe = new Stripe(secretKey)

        const { orderId } = await request.json()
        if (!orderId) return response({ error: 'Missing orderId' }, 400);

        // Fetch order to verify
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        })

        if (!order) return response({ error: 'Order not found' }, 404);

        // Safety Guard: Only pending orders can request payment
        if (order.status !== "PENDING") {
            return response({ error: 'Order is not in pending state' }, 400)
        }
        // Ensure user owns this order
        if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return response({ error: 'Forbidden' }, 403);
        }
        // Server-side recalculation of the amount (satangs/cents)
        const amountInCents = Math.round(order.total * APP_CONFIG.currency.stripeFactor);
        // Minimum check for Stripe THB transactions (10 THB minimum)
        if (amountInCents < 1000) {
            return response({ error: 'Stripe requires a minimum total of ฿10.00' }, 400);
        }

        let paymentIntent;

        // If order already has a payment intent, retrieve it to avoid duplicates
        if (order.stripePaymentIntentId) {
            try {
                paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

                // If amount changed or intent is cancelled, recreate. Else update.
                if (paymentIntent.amount !== amountInCents || paymentIntent.status === 'canceled') {
                    paymentIntent = await stripe.paymentIntents.create({
                        amount: amountInCents,
                        currency: APP_CONFIG.currency.code.toLowerCase(),
                        automatic_payment_methods: { enabled: true },
                        metadata: { orderId: order.id }
                    })
                }

            } catch (error) {
                // Fallback: create a new one if retrieval fails
                paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents,
                    currency: APP_CONFIG.currency.code.toLowerCase(),
                    automatic_payment_methods: { enabled: true },
                    metadata: { orderId: order.id }
                });
            }
        } else {
            // Create new intent
            paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: APP_CONFIG.currency.code.toLowerCase(),
                automatic_payment_methods: { enabled: true },
                metadata: { orderId: order.id }
            });
        }

        // Keep Prisma DB updated with Stripe Intent ID
        await db.order.update({
            where: { id: orderId },
            data: { stripePaymentIntentId: paymentIntent.id }
        })

        return response({
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error('[Create Payment Intent API Error]:', error);
        return response({ error: error.message || 'Internal Server Error' }, 500);
    }
}