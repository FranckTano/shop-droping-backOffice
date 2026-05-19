package com.shopdropping.backoffice.dto;

import com.shopdropping.backoffice.entity.CommandeStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CommandeDto(
        Long id,
        String numero,
        String clientNom,
        String clientTelephone,
        String clientEmail,
        String clientAdresse,
        BigDecimal montantTotal,
        CommandeStatus statut,
        String notes,
        Boolean whatsappMessageSent,
        List<LigneCommandeDto> lignes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
