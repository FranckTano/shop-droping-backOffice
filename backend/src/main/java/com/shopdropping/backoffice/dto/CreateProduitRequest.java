package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateProduitRequest(
        @NotBlank String nom,
        String description,
        @NotNull @Positive BigDecimal prix,
        BigDecimal prixPromo,
        Long categorieId,
        Boolean enPromotion,
        Boolean nouveau,
        String equipe,
        String saison,
        String marque,
        String couleursDisponibles,
        String imagePrincipale
) {}
