package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints accessibles par ADMIN et SUPER_ADMIN.
 * - GET  /api/admin/admin-actif        → numéro de l'admin qui reçoit les commandes
 * - POST /ws/securite/auth/reset-password → réinitialisation mot de passe (public)
 */
@RestController
@RequiredArgsConstructor
public class AdminActifController {

    private final UtilisateurService utilisateurService;

    @GetMapping("/api/admin/admin-actif")
    public ResponseEntity<Map<String, String>> getAdminActif() {
        return ResponseEntity.ok(utilisateurService.getNumeroAdminActif());
    }

    @PostMapping("/ws/securite/auth/reset-password")
    public ResponseEntity<Map<String, String>> resetMotDePasse(
            @RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Le nom d'utilisateur est requis."));
        }
        try {
            String tempPassword = utilisateurService.resetMotDePasse(username);
            return ResponseEntity.ok(Map.of(
                    "message",       "Mot de passe réinitialisé avec succès.",
                    "tempPassword",  tempPassword
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
