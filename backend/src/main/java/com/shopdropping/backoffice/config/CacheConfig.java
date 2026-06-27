package com.shopdropping.backoffice.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    public static final String CACHE_PRODUITS    = "produits";
    public static final String CACHE_CATEGORIES  = "categories";
    public static final String CACHE_DASHBOARD   = "dashboard";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager mgr = new CaffeineCacheManager(
                CACHE_PRODUITS, CACHE_CATEGORIES, CACHE_DASHBOARD);
        mgr.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats());
        return mgr;
    }
}
