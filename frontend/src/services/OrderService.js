import { API_BASE_URL, getAuthHeader } from './AuthService';

const OrderService = {
    placeOrder: async (orderRequest) => {
        const response = await fetch(`${API_BASE_URL}/orders/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(orderRequest)
        });
        if (!response.ok) throw new Error('Failed to place order');
        return response.json();
    },

    getUserOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getOrderById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch order details');
        return response.json();
    },

    cancelOrder: async (id) => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
            method: 'POST',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to cancel order');
        return response.json();
    }
};

export default OrderService;
