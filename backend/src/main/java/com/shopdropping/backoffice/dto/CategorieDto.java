package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.NotBlank;

public record CategorieDto(
        Long id,
        @NotBlank String nom,
        String description,
        String imageUrl,
        Boolean actif
) {}
