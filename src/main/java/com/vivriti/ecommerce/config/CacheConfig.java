package com.vivriti.ecommerce.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * Cache configuration for the e-commerce application.
 * Uses Spring's simple in-memory cache for fast product catalog access.
 * For production, consider Redis or another distributed cache.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
            new ConcurrentMapCache("products"),
            new ConcurrentMapCache("productDetails"),
            new ConcurrentMapCache("recommendedProducts"),
            new ConcurrentMapCache("productRatings")
        ));
        return cacheManager;
    }
}
