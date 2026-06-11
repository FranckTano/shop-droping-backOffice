package com.shopdropping.backoffice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Keep-alive circulaire pour Render.com free tier.
 * BackOffice → ping → FrontOffice, et réciproquement.
 * Intervalle 13 min < seuil de suspension de 15 min.
 */
@Service
public class KeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveService.class);

    // Singleton thread-safe : RestTemplate est réutilisable
    private static final RestTemplate REST_TEMPLATE = new RestTemplate();

    @Value("${keepalive.target-url:}")
    private String targetUrl;

    @Scheduled(fixedDelay = 780_000, initialDelay = 60_000)
    public void ping() {
        if (targetUrl == null || targetUrl.isBlank()) {
            return;
        }
        try {
            REST_TEMPLATE.getForObject(targetUrl, String.class);
            log.info("[KeepAlive] Ping OK → {}", targetUrl);
        } catch (Exception e) {
            log.warn("[KeepAlive] Ping échoué → {} : {}", targetUrl, e.getMessage());
        }
    }
}
