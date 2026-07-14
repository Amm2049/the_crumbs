import Stripe from 'stripe';
import db from '@/lib/db';
import { broadcast } from '@/lib/pusher-broadcast';
import { response } from '@/lib/api-helper';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    const body = await request.text(); // 👈 Critical: Must read raw text for signature check
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return response({ error: 'Signature verification failed' }, 400);
    }

    // Handle the succeeded event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
            console.warn('[Stripe Webhook]: No orderId in metadata.');
            return response({ received: true });
        }

        try {
            // 1. Transaction to update order idempotently
            //    Returns { order, wasUpdated } so we only broadcast when a real change happened.
            //    This prevents duplicate Pusher notifications if Stripe retries the webhook.
            const result = await db.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId }
                });

                if (!order) throw new Error('ORDER_NOT_FOUND');

                // Idempotency: skip if already processed
                if (order.status !== 'PENDING') {
                    return { order, wasUpdated: false };
                }

                // Update status to PROCESSING (payment confirmed)
                const updated = await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'PROCESSING' },
                    include: { user: { select: { name: true } } }
                });

                return { order: updated, wasUpdated: true };
            });

            // 2. Broadcast live status updates ONLY if the status actually changed
            if (result.wasUpdated) {
                // Notify the customer's order page
                broadcast.orderStatusChanged(
                    result.order.userId,
                    result.order.id,
                    result.order.status,
                    result.order.updatedAt.toISOString()
                );

                // Notify admin dashboard with new-order chime
                const customerName = result.order.user?.name || 'Customer';
                broadcast.newOrder(result.order.id, customerName, result.order.total);
            }

            console.log(`[Stripe Webhook]: Order #${orderId} — ${result.wasUpdated ? 'Updated to PROCESSING' : 'Already processed (skipped)'}`);
        } catch (err) {
            console.error('[Stripe Webhook Processing Error]:', err.message);
            return response({ error: 'Processing error' }, 500);
        }
    }

    return response({ received: true });
}