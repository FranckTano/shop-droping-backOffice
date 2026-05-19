package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateUtilisateurRequest(
        @NotBlank String username,
        @NotBlank String password,
        @NotBlank String nom,
        @NotBlank String prenoms,
        @NotBlank String role
) {}
