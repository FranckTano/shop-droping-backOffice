package com.shopdropping.backoffice.dto;

import com.shopdropping.backoffice.entity.CommandeStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CommandeRecenteDto(
        Long id,
        String numero,
        String clientNom,
        String clientTelephone,
        BigDecimal montantTotal,
        CommandeStatus statut,
        LocalDateTime createdAt
) {}
