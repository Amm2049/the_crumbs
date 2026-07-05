# 🥐 Real-time Features Step-by-Step Implementation Guide

This updated guide shifts from a per-order channel (`private-order-{id}`) to a **per-user channel** (`private-user-{userId}`). 

This architecture allows the customer's main **Orders List** to update in real time when any order changes status, and it simplifies the **Order Details Modal** by passing updates down naturally through React props.

---

## 🛠️ Step 1: Install Dependencies
Run this command in your project root terminal to install the official Pusher Server and Client SDKs:
```bash
npm install pusher pusher-js
```

---

## 🔑 Step 2: Configure Environment Variables
Open your [.env](file:///d:/RSU/FullStack/the-crumbs/.env) file and add your Pusher credentials at the bottom:
```env
# ────────────────────────────────────────────────
# PUSHER CHANNELS (Real-time WebSockets)
# ────────────────────────────────────────────────
PUSHER_APP_ID="your_app_id"
NEXT_PUBLIC_PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your_cluster"
```

---

## 📂 Part A: Shared Utilities & Decoupled Backend

### Step 3: Create Channel & Event Constants
Update [lib/pusher-constants.js](file:///d:/RSU/FullStack/the-crumbs/lib/pusher-constants.js):
```javascript
export const PUSHER_CHANNELS = {
    PRODUCTS: 'products',                 // Public channel (guest & customer storefront)
    ADMIN: 'private-admin',               // Private channel (admin-only alerts)
    USER: (id) => `private-user-${id}`,   // Private channel (order owner's page & list)
};

export const PUSHER_EVENTS = {
    STOCK_CHANGED: 'stock-changed',       // Product stock changes
    STATUS_CHANGED: 'status-changed',     // Order status updates
    NEW_ORDER: 'new-order',               // New order received
    ORDER_CANCELLED: 'order-cancelled',   // Customer cancelled an order
    LOW_STOCK: 'low-stock',               // Product stock dropped under warning limit
};
```

---

### Step 4: Configure Pusher Server Singleton
Create [lib/pusher.js](file:///d:/RSU/FullStack/the-crumbs/lib/pusher.js) to initialize the backend Pusher instance:
```javascript
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export default pusher;
```

---

### Step 5: Create Server-Side Broadcast Helper
Update [lib/pusher-broadcast.js](file:///d:/RSU/FullStack/the-crumbs/lib/pusher-broadcast.js) to trigger the status update on the **user** channel:
```javascript
import pusher from "./pusher"
import { PUSHER_CHANNELS, PUSHER_EVENTS } from './pusher-constants'

export const broadcast = {
    // Broadcast product stock changes (public)
    stockChanged(productId, stock, isAvailable) {
        return safeTrigger(
            PUSHER_CHANNELS.PRODUCTS,
            PUSHER_EVENTS.STOCK_CHANGED,
            { id: productId, stock, isAvailable }
        )
    },

    // Broadcast order status changes to customer user (private-user-{userId})
    orderStatusChanged(userId, orderId, status, updatedAt) {
        return safeTrigger(
            PUSHER_CHANNELS.USER(userId),
            PUSHER_EVENTS.STATUS_CHANGED,
            { orderId, status, updatedAt }
        )
    },

    // Broadcast new order to admins (private)
    newOrder(orderId, customerName, total) {
        return safeTrigger(
            PUSHER_CHANNELS.ADMIN,
            PUSHER_EVENTS.NEW_ORDER,
            { id: orderId, customerName, total }
        )
    },

    // Broadcast order cancellation to admins (private)
    orderCancelled(orderId, customerName, total) {
        return safeTrigger(
            PUSHER_CHANNELS.ADMIN,
            PUSHER_EVENTS.ORDER_CANCELLED,
            { id: orderId, customerName, total }
        )
    },

    // Broadcast low-stock warning to admins (private)
    lowStockAlert(productId, name, stock) {
        return safeTrigger(
            PUSHER_CHANNELS.ADMIN,
            PUSHER_EVENTS.LOW_STOCK,
            { id: productId, name, stock }
        );
    }
}

async function safeTrigger(channel, event, data) {
    try {
        await pusher.trigger(channel, event, data)
    } catch (error) {
        console.error(`Pusher Broadcast Error [${channel} - ${event}]:`, error);
    }
}
```

---

## 🔐 Part B: Security & API Routes

### Step 6: Create Pusher Authorization API Endpoint
Update [app/api/pusher/auth/route.js](file:///d:/RSU/FullStack/the-crumbs/app/api/pusher/auth/route.js) to authorize the `private-user-{userId}` channel:
```javascript
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import pusher from '@/lib/pusher';
import { response } from '@/lib/api-helper';

export async function POST(request) {
    try {
        const session = await auth()
        if (!session) return response({ error: "Unauthorized" }, 401)

        const data = await request.formData()
        const socketId = data.get('socket_id')
        const channelName = data.get('channel_name')

        if (!socketId || !channelName) return response({ error: "Missing socket_id or channel_name" }, 400)

        // 1. Authorize Admin Channel
        if (channelName === 'private-admin') {
            if (session.user.role !== 'ADMIN') return response({ error: 'Forbidden' }, 403)

            const authResponse = pusher.authorizeChannel(socketId, channelName)
            return response(authResponse)
        }

        // 2. Authorize Customer User Channel (private-user-{userId})
        if (channelName.startsWith('private-user-')) {
            const targetUserId = channelName.replace('private-user-', '')

            const isSelf = targetUserId === session.user.id
            const isAdmin = session.user.role === 'ADMIN'

            if (!isSelf && !isAdmin) return response({ error: 'Forbidden' }, 403)

            const authResponse = pusher.authorizeChannel(socketId, channelName)
            return response(authResponse)
        }

        return response({ error: 'Unsupported channel name' }, 400);

    } catch (error) {
        console.error('Pusher Auth Endpoint Error:', error)
        return response({ error: 'Internal Server Error' }, 500)
    }
}
```

---

### Step 7: Update Checkout Endpoint
*(Verify this matches [app/api/orders/route.js](file:///d:/RSU/FullStack/the-crumbs/app/api/orders/route.js))*
```javascript
            // Create the order inside transaction
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    address,
                    notes: notes || null,
                    items: { create: orderItemsData },
                },
                include: {
                    items: { include: { product: true } }
                }
            });

            // Clear user cart
            await tx.cartItem.deleteMany({ where: { userId } });

            return newOrder;
        });

        // --- Broadcast Real-time Updates AFTER Transaction Succeeds ---
        const customerName = session.user.name || 'Customer'
        broadcast.newOrder(order.id, customerName, order.total)

        if (order.items) {
            for (const item of order.items) {
                const product = item.product
                if (product) {
                    broadcast.stockChanged(product.id, product.stock, product.isAvailable)
                    if (product.stock < 5) {
                        broadcast.lowStockAlert(product.id, product.name, product.stock)
                    }
                }
            }
        }

        return response(order, 201);
```

---

### Step 8: Update Order Patch Endpoint
Update [app/api/orders/[id]/route.js](file:///d:/RSU/FullStack/the-crumbs/app/api/orders/[id]/route.js) to broadcast status changes to the private-user channel:
```javascript
    // 1. Perform the update first
    const updateResponse = await handleUpdate(id, db.order, { data: { status } })

    // 2. If successful, fetch and trigger broadcasts
    if (updateResponse.status === 200) {
        const updatedOrder = await db.order.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } },
                items: { include: { product: true } }
            }
        })

        if (updatedOrder) {
            // Notify the customer tracking the order list page & modal
            broadcast.orderStatusChanged(updatedOrder.userId, id, updatedOrder.status, updatedOrder.updatedAt.toISOString())

            // If cancelled, notify admin & restore storefront stock
            if (updatedOrder.status === 'CANCELLED') {
                const cName = updatedOrder.user?.name || 'Customer'
                broadcast.orderCancelled(id, cName, updatedOrder.total)

                if (updatedOrder.items) {
                    for (const item of updatedOrder.items) {
                        if (item.product) {
                            broadcast.stockChanged(item.product.id, item.product.stock, item.product.isAvailable)
                        }
                    }
                }
            }
        }
    }

    return updateResponse
```

---

## 🎨 Part C: Frontend Integration

### Step 9: client-side connection hook
*(Verify this matches [hooks/usePusher.js](file:///d:/RSU/FullStack/the-crumbs/hooks/usePusher.js))*

---

### Step 10: Visual Timeline Component
*(Verify this matches [components/client/OrderStatusTimeline.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/OrderStatusTimeline.jsx))*

---

### Step 11: Simplify Details Modal (Reads from Prop)
Update [components/client/OrderDetailModal.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/OrderDetailModal.jsx). Since the parent component now receives and manages the websocket state updates, the modal is simplified back to using standard props, while keeping the timeline rendering:
- Remove local `usePusher` and websocket subscriptions/polling inside this file.
- Simply render `<OrderStatusTimeline status={order.status} updatedAt={order.updatedAt} />`.

```javascript
'use client'

import { X, MapPin, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import OrderStatusTimeline from './OrderStatusTimeline'

const statusClasses = {
    PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    READY: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
    DELIVERED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

export default function OrderDetailModal({ order, onClose, onCancelled }) {
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelError, setCancelError] = useState('')

    const handleCancel = async () => {
        setCancelError('')
        setIsCancelling(true)

        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'CANCELLED',
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to cancel order')
            }

            if (onCancelled) {
                await onCancelled(order.id)
            }
            onClose()
        } catch (error) {
            console.error('Cancel order error:', error)
            setCancelError(error.message || 'Failed to cancel order')
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-100 dark:border-zinc-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-black text-[var(--bakery-text)]">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-[var(--bakery-text-muted)]">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-amber-50 dark:hover:bg-zinc-800 hover:text-amber-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-5">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">Status</span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusClasses[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Timeline */}
                    <OrderStatusTimeline status={order.status} updatedAt={order.updatedAt} />

                    {/* Items */}
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--bakery-text-muted)]">Items</p>
                        <ul className="space-y-2">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-zinc-800/50 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-bold text-[var(--bakery-text)]">{item.product?.name ?? 'Product'}</p>
                                        <p className="text-xs text-[var(--bakery-text-muted)]">x{item.quantity} · ${Number(item.price).toFixed(2)} each</p>
                                    </div>
                                    <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                                        ${(item.quantity * Number(item.price)).toFixed(2)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t border-amber-100 dark:border-zinc-800 pt-4">
                        <span className="text-sm font-bold text-[var(--bakery-text-muted)]">Total</span>
                        <span className="text-xl font-black text-[var(--bakery-text)]">${Number(order.total).toFixed(2)}</span>
                    </div>

                    {/* Delivery Address */}
                    <div className="rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                            <MapPin size={11} />
                            <span>Delivery Address</span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--bakery-text)]">{order.address || 'No address provided (historical order)'}</p>
                    </div>

                    {/* Special Instructions */}
                    {order.notes && (
                        <div className="rounded-xl border border-amber-100 dark:border-zinc-700 bg-amber-50/30 dark:bg-zinc-800/50 px-4 py-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                                <MessageSquare size={11} />
                                <span>Special Instructions</span>
                            </div>
                            <p className="text-sm italic text-[var(--bakery-text-muted)]">{order.notes}</p>
                        </div>
                    )}

                    {/* Cancel Button */}
                    {order.status === 'PENDING' && (
                        <div className="pt-2">
                            {cancelError && (
                                <p className="mb-2 text-center text-xs font-bold text-red-500">{cancelError}</p>
                            )}
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="w-full rounded-xl border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 py-3 text-sm font-black uppercase tracking-widest text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
```

---

### Step 12: Real-time Listener on Orders List
Modify [components/client/OrdersClient.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/OrdersClient.jsx).
1. Add imports:
   ```javascript
   import { useSession } from 'next-auth/react';
   import { usePusher } from '@/hooks/usePusher';
   ```
2. Initialize Pusher, hook up the session, and bind events inside the `OrdersClient` component:
   ```javascript
   const { data: session } = useSession()
   const { client, connectionState } = usePusher()

   useEffect(() => {
     if (!client || !session?.user?.id) return

     const channelName = `private-user-${session.user.id}`
     const channel = client.subscribe(channelName)

     channel.bind('status-changed', (data) => {
       // Update orders list state in-place instantly!
       setOrders((prevOrders) =>
         prevOrders.map((o) =>
           o.id === data.orderId
             ? { ...o, status: data.status, updatedAt: data.updatedAt }
             : o
         )
       )
     })

     // Fallback Polling if socket disconnects
     let fallbackInterval = null
     if (connectionState === 'failed' || connectionState === 'unavailable') {
       fallbackInterval = setInterval(async () => {
         try {
           const result = await fetchJson(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`)
           const list = Array.isArray(result?.data) ? result.data : []
           setOrders(list)
         } catch (error) {
           console.error('Fallback polling error:', error)
         }
       }, 15000)
     }

     return () => {
       channel.unbind('status-changed')
       client.unsubscribe(channelName)
       if (fallbackInterval) clearInterval(fallbackInterval)
     }
   }, [client, session?.user?.id, connectionState, currentPage])
   ```
3. Look up the active order from the live `orders` state array before passing it to the modal to make sure it receives prop updates:
   ```javascript
   const activeOrder = orders.find((o) => o.id === selectedOrder?.id) || selectedOrder
   ```
4. Render the modal using `activeOrder` instead of `selectedOrder`:
   ```javascript
   {selectedOrder && (
     <OrderDetailModal
       order={activeOrder}
       onClose={() => setSelectedOrder(null)}
       onCancelled={handleCancelled}
     />
   )}
   ```

---

### Step 13: Live Storefront Product Stock Updates
Update [components/client/ShopProductsClient.jsx](file:///d:/RSU/FullStack/the-crumbs/components/client/ShopProductsClient.jsx) to sync stock counts.
1. Add imports:
   ```javascript
   import { usePusher } from '@/hooks/usePusher';
   ```
2. Near the top of the `ShopProductsClient` component, set up the listener to bind to the public `products` channel:
   ```javascript
   const { client } = usePusher();

   useEffect(() => {
     if (!client) return;

     const channel = client.subscribe('products');
     channel.bind('stock-changed', (data) => {
       // Update stock in products list
       setProducts((prevProducts) =>
         prevProducts.map((p) =>
           p.id === data.id
             ? { ...p, stock: data.stock, isAvailable: data.isAvailable }
             : p
         )
       );
     });

     return () => {
       channel.unbind('stock-changed');
       client.unsubscribe('products');
     };
   }, [client]);
   ```

---

## 🔔 Part D: Admin Web Audio Chime & Notifications

### Step 14: Synthesize Audio Chimes & Alert Toasts
Update [components/admin/AdminNavbar.jsx](file:///d:/RSU/FullStack/the-crumbs/components/admin/AdminNavbar.jsx) (or your admin dashboard shell) to catch real-time admin events:
1. Add imports:
   ```javascript
   import { useEffect, useState } from 'react';
   import { usePusher } from '@/hooks/usePusher';
   ```
2. Define a double chime tone synthesizer using the browser's native **Web Audio API**:
   ```javascript
   function playChime() {
     try {
       const ctx = new (window.AudioContext || window.webkitAudioContext)();
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       osc.connect(gain);
       gain.connect(ctx.destination);
       osc.type = 'sine';
       
       // Play Dual-Tone bell sound (D5 note, then A5 note)
       osc.frequency.setValueAtTime(587.33, ctx.currentTime); 
       osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
       
       gain.gain.setValueAtTime(0.06, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
       
       osc.start(ctx.currentTime);
       osc.stop(ctx.currentTime + 0.5);
     } catch (e) {
       console.error('Audio chime error:', e);
     }
   }
   ```
3. Set up the subscription to `private-admin` inside the component:
   ```javascript
   const { client } = usePusher();
   const [toastMessage, setToastMessage] = useState(null);

   useEffect(() => {
     if (!client) return;

     const channel = client.subscribe('private-admin');

     // 1. New Order alert
     channel.bind('new-order', (data) => {
       playChime();
       showToast(`🎉 New order received! Total: $${Number(data.total).toFixed(2)} by ${data.customerName}`);
     });

     // 2. Order Cancelled alert
     channel.bind('order-cancelled', (data) => {
       playChime();
       showToast(`❌ Order #${data.id.slice(0,8)} was cancelled by ${data.customerName}`);
     });

     // 3. Low stock warning
     channel.bind('low-stock', (data) => {
       showToast(`⚠️ Low Stock Alert: "${data.name}" has only ${data.stock} items left!`);
     });

     return () => {
       channel.unbind_all();
       client.unsubscribe('private-admin');
     };
   }, [client]);

   function showToast(msg) {
     setToastMessage(msg);
     // Auto-dismiss toast in 5 seconds
     setTimeout(() => setToastMessage(null), 5000);
   }
   ```
4. Render the notification block in your JSX return:
   ```javascript
   {toastMessage && (
     <div className="fixed bottom-5 right-5 z-[9999] flex max-w-sm rounded-2xl border border-amber-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-md animate-bounce">
       <p className="text-xs font-black text-[var(--bakery-text)]">{toastMessage}</p>
     </div>
   )}
   ```
