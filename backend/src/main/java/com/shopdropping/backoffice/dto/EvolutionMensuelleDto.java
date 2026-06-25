package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;

public record EvolutionMensuelleDto(
        String mois,
        long totalCommandes,
        long confirmees,
        long annulees,
        long livrees,
        BigDecimal caConfirmees
) {}
