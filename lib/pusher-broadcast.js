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