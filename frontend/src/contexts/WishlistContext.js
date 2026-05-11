import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyWishlist, addToWishlist, removeFromWishlist } from '../services/WishlistService';
import { message } from 'antd';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children, currentUser }) => {
    const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [messageApi, messageContext] = message.useMessage();

    // Clear wishlist when user logs out
    useEffect(() => {
        if (!currentUser) {
            setWishlistProductIds(new Set());
            setFetched(false);
        }
    }, [currentUser]);

    // Lazy load wishlist - only fetch when explicitly called
    const loadWishlist = useCallback(async () => {
        if (!currentUser || currentUser.role === 'ADMIN') {
            setWishlistProductIds(new Set());
            return;
        }

        if (fetched) return; // Already loaded

        try {
            setLoading(true);
            const data = await getMyWishlist();
            const ids = new Set(data.map(p => p.id));
            setWishlistProductIds(ids);
            setFetched(true);
        } catch (err) {
            console.error('Failed to fetch wishlist', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, fetched]);

    const isInWishlist = useCallback((productId) => {
        return wishlistProductIds.has(productId);
    }, [wishlistProductIds]);

    const toggleWishlist = useCallback(async (product) => {
        if (!currentUser) {
            messageApi.warning('Please login to update wishlist');
            return;
        }

        // Load wishlist first if not loaded yet
        if (!fetched) {
            await loadWishlist();
        }

        const productId = product.id;
        const currentlyInWishlist = wishlistProductIds.has(productId);

        try {
            if (currentlyInWishlist) {
                await removeFromWishlist(productId);
                setWishlistProductIds(prev => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                messageApi.success('Removed from wishlist');
            } else {
                await addToWishlist(productId);
                setWishlistProductIds(prev => {
                    const next = new Set(prev);
                    next.add(productId);
                    return next;
                });
                messageApi.success('Added to wishlist');
            }
        } catch (err) {
            messageApi.error(err.message || 'Failed to update wishlist');
            throw err; // allow components to catch if they want
        }
    }, [currentUser, wishlistProductIds, messageApi, fetched, loadWishlist]);

    return (
        <WishlistContext.Provider value={{ wishlistProductIds, loading, isInWishlist, toggleWishlist, loadWishlist, fetched }}>
            {messageContext}
            {children}
        </WishlistContext.Provider>
    );
};
