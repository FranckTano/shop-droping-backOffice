package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProduitRequest(
        @NotBlank @Size(min = 2, max = 255) String nom,
        @Size(max = 5000) String description,
        @NotNull @Positive @DecimalMax("999999.99") BigDecimal prix,
        @Positive @DecimalMax("999999.99") BigDecimal prixPromo,
        Long categorieId,
        Boolean enPromotion,
        Boolean nouveau,
        @Size(max = 100) String equipe,
        @Pattern(regexp = "^\\d{4}-\\d{4}$|^$", message = "Format saison invalide (ex: 2024-2025)") String saison,
        @Size(max = 50) String marque,
        @Size(max = 255) String couleursDisponibles,
        @Size(max = 500) String imagePrincipale
) {}
