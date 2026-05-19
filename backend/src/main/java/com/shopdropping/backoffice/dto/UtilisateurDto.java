package com.shopdropping.backoffice.dto;

import java.time.LocalDateTime;

public record UtilisateurDto(
        Long id,
        String username,
        String nom,
        String prenoms,
        String role,
        String statut,
        LocalDateTime createdAt
) {}
