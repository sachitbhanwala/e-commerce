import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import CartService from '../services/CartService';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, currentUser }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [messageApi, messageContext] = message.useMessage();

    // Clear cart when user logs out
    useEffect(() => {
        if (!currentUser) {
            setCartItems([]);
            setFetched(false);
        }
    }, [currentUser]);

    // Lazy fetch cart - only load when explicitly called
    const fetchCart = useCallback(async () => {
        if (!currentUser) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            const data = await CartService.getCart();
            setCartItems(data.items || []);
            setFetched(true);
        } catch (err) {
            console.error('Failed to fetch cart', err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Check if product is in cart
    const isInCart = useCallback((productId) => {
        return cartItems.some(item => item.productId === productId);
    }, [cartItems]);

    // Get cart item by product ID
    const getCartItem = useCallback((productId) => {
        return cartItems.find(item => item.productId === productId);
    }, [cartItems]);

    // Add to cart
    const addToCart = useCallback(async (productId, quantity = 1) => {
        if (!currentUser) {
            messageApi.warning('Please login to add to cart');
            return;
        }

        try {
            await CartService.addToCart(productId, quantity);
            
            // Refresh cart after adding
            await fetchCart();
            
            messageApi.success('Added to cart');
            return true;
        } catch (err) {
            messageApi.error(err.message || 'Failed to add to cart');
            return false;
        }
    }, [currentUser, fetchCart, messageApi]);

    // Remove from cart
    const removeFromCart = useCallback(async (productId) => {
        if (!currentUser) {
            return;
        }

        try {
            await CartService.removeFromCart(productId);
            
            // Refresh cart after removing
            await fetchCart();
            
            messageApi.success('Removed from cart');
            return true;
        } catch (err) {
            messageApi.error(err.message || 'Failed to remove from cart');
            return false;
        }
    }, [currentUser, fetchCart, messageApi]);

    // Update quantity
    const updateQuantity = useCallback(async (productId, quantity) => {
        if (!currentUser) {
            return;
        }

        try {
            await CartService.updateQuantity(productId, quantity);
            
            // Refresh cart after updating
            await fetchCart();
            
            return true;
        } catch (err) {
            messageApi.error(err.message || 'Failed to update quantity');
            return false;
        }
    }, [currentUser, fetchCart, messageApi]);

    // Clear cart
    const clearCart = useCallback(async () => {
        if (!currentUser) {
            return;
        }

        try {
            await CartService.clearCart();
            setCartItems([]);
            setFetched(false);
            
            return true;
        } catch (err) {
            messageApi.error(err.message || 'Failed to clear cart');
            return false;
        }
    }, [currentUser, messageApi]);

    // Get cart count
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Get cart total
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const value = {
        cartItems,
        loading,
        fetched,
        isInCart,
        getCartItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart: fetchCart,
        cartCount,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {messageContext}
            {children}
        </CartContext.Provider>
    );
};
