package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;

public record UpdateProduitRequest(
        String nom,
        String description,
        BigDecimal prix,
        BigDecimal prixPromo,
        Long categorieId,
        Boolean actif,
        Boolean enPromotion,
        Boolean nouveau,
        String equipe,
        String saison,
        String marque,
        String couleursDisponibles,
        String imagePrincipale
) {}
