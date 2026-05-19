package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProduitDto(
        Long id,
        String nom,
        String description,
        BigDecimal prix,
        BigDecimal prixPromo,
        Long categorieId,
        String categorieNom,
        String imagePrincipale,
        Boolean actif,
        Boolean enPromotion,
        Boolean nouveau,
        String equipe,
        String saison,
        String marque,
        String couleursDisponibles,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
