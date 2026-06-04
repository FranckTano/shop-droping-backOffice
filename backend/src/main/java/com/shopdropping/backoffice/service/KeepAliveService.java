package com.shopdropping.backoffice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service de keep-alive circulaire.
 *
 * Render.com (free tier) suspend les services après 15 min d'inactivité.
 * Ce service ping le FrontOffice backend toutes les 13 minutes pour maintenir
 * les deux services actifs simultanément (ping circulaire).
 *
 * BackOffice → ping → FrontOffice
 * FrontOffice → ping → BackOffice
 * → les deux restent éveillés tant qu'un seul l'est.
 */
@Service
public class KeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveService.class);

    @Value("${keepalive.target-url:}")
    private String targetUrl;

    // 13 minutes = 780 000 ms (en-dessous du seuil de 15 min de Render)
    @Scheduled(fixedDelay = 780_000, initialDelay = 60_000)
    public void ping() {
        if (targetUrl == null || targetUrl.isBlank()) {
            return;
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getForObject(targetUrl, String.class);
            log.info("[KeepAlive] Ping OK → {}", targetUrl);
        } catch (Exception e) {
            log.warn("[KeepAlive] Ping échoué → {} : {}", targetUrl, e.getMessage());
        }
    }
}
