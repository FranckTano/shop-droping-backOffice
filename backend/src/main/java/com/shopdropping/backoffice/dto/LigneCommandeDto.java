package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;

public record LigneCommandeDto(
        Long id,
        Long produitId,
        String produitNom,
        String produitImage,
        String taille,
        String couleur,
        Integer quantite,
        BigDecimal prixUnitaire,
        BigDecimal prixOptionsUnitaire,
        Boolean badgesOfficiels,
        Boolean flocage,
        String flocageNom,
        String flocageNumero,
        BigDecimal prixTotal
) {}
