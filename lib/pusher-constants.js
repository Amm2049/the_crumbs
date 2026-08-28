export const PUSHER_CHANNELS = {
    // Single fixed channels
    PRODUCTS: 'products',                 // Public channel (guest & customer storefront)
    ADMIN: 'private-admin',               // Private channel (admin-only alerts)
    USER: (id) => `private-user-${id}`,   // Private channel (order owner's page & list)
};

export const PUSHER_EVENTS = {
    STOCK_CHANGED: 'stock-changed', // Product stock changes
    STATUS_CHANGED: 'status-changed', // Order status updates
    NEW_ORDER: 'new-order', // New order received
    ORDER_CANCELLED: 'order-cancelled', // Customer cancelled an order
    LOW_STOCK: 'low-stock' // Product stock dropped under warning limit
}

