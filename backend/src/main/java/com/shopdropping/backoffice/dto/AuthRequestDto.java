package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequestDto(
        @NotBlank String username,
        @NotBlank String password
) {}
