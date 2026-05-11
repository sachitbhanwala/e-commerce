import { API_BASE_URL, getAuthHeader } from './AuthService';

const CartService = {
    getCart: async () => {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },

    addToCart: async (productId, quantity) => {
        const response = await fetch(`${API_BASE_URL}/cart/add?productId=${productId}&quantity=${quantity}`, {
            method: 'POST',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return response.json();
    },

    removeFromCart: async (productId) => {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
        return response.json();
    },

    updateQuantity: async (productId, quantity) => {
        const response = await fetch(`${API_BASE_URL}/cart/update?productId=${productId}&quantity=${quantity}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to update quantity');
        return response.json();
    },

    clearCart: async () => {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to clear cart');
    }
};

export default CartService;
