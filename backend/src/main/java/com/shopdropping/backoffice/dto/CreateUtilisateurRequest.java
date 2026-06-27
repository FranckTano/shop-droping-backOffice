package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.*;

public record CreateUtilisateurRequest(
        @NotBlank @Size(min = 3, max = 50) @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username: lettres, chiffres, _, ., - uniquement") String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(min = 2, max = 100) String nom,
        @NotBlank @Size(min = 2, max = 100) String prenoms,
        @NotBlank @Pattern(regexp = "^(ADMIN|SUPER_ADMIN)$", message = "Rôle invalide") String role,
        @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Numéro de téléphone invalide") String telephone
) {}
