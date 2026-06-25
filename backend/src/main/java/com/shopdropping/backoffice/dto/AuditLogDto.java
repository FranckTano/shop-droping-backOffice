package com.shopdropping.backoffice.dto;

import com.shopdropping.backoffice.entity.TypeAction;
import com.shopdropping.backoffice.entity.TypeEntite;

import java.time.LocalDateTime;

public record AuditLogDto(
        Long id,
        String adminUsername,
        String adminNom,
        TypeAction typeAction,
        TypeEntite typeEntite,
        Long entiteId,
        String entiteReference,
        String description,
        LocalDateTime createdAt
) {}
