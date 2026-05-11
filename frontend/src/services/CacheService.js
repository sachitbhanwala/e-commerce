/**
 * Simple in-memory cache service with TTL (Time To Live)
 * Reduces redundant API calls by caching responses
 */
class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Generates a cache key from endpoint and params
     */
    generateKey(endpoint, params = {}) {
        const paramString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return paramString ? `${endpoint}?${paramString}` : endpoint;
    }

    /**
     * Get cached data if it exists and hasn't expired
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        // Check if expired
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        console.log('🎯 Cache hit:', key);
        return cached.data;
    }

    /**
     * Set data in cache with optional TTL
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl,
            timestamp: Date.now()
        });
        console.log('💾 Cache set:', key, `(TTL: ${ttl}ms)`);
    }

    /**
     * Invalidate specific cache key or pattern
     */
    invalidate(keyOrPattern) {
        if (typeof keyOrPattern === 'string') {
            // Exact match
            if (this.cache.has(keyOrPattern)) {
                this.cache.delete(keyOrPattern);
                console.log('🗑️ Cache invalidated:', keyOrPattern);
            }
        } else if (keyOrPattern instanceof RegExp) {
            // Pattern match
            const keys = Array.from(this.cache.keys());
            keys.forEach(key => {
                if (keyOrPattern.test(key)) {
                    this.cache.delete(key);
                    console.log('🗑️ Cache invalidated (pattern):', key);
                }
            });
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Wrapper for fetch with automatic caching
     */
    async cachedFetch(key, fetchFn, ttl = this.defaultTTL) {
        // Check cache first
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch fresh data
        const data = await fetchFn();
        
        // Store in cache
        this.set(key, data, ttl);
        
        return data;
    }
}

// Export singleton instance
const cacheService = new CacheService();
export default cacheService;
