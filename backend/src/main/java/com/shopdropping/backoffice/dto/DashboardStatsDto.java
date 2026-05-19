package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsDto(
        long totalCommandes,
        long commandesEnAttente,
        long commandesValidees,
        long commandesLivrees,
        long commandesAnnulees,
        long commandesStandby,
        BigDecimal chiffreAffaires,
        BigDecimal chiffreAffairesLivrees,
        long totalProduits,
        long produitsActifs,
        long produitsArchives,
        List<DataPointDto> commandesParJour,
        List<DataPointDto> chiffreAffairesParMois
) {}
