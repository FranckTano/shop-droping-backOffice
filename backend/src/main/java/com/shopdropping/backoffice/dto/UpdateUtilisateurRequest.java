package com.shopdropping.backoffice.dto;

import jakarta.validation.constraints.*;

public record UpdateUtilisateurRequest(
        @Size(min = 8, max = 100) String password,
        @Size(min = 2, max = 100) String nom,
        @Size(min = 2, max = 100) String prenoms,
        @Pattern(regexp = "^(ADMIN|SUPER_ADMIN)$", message = "Rôle invalide") String role,
        @Pattern(regexp = "^(ACTIF|INACTIF)$", message = "Statut invalide") String statut,
        @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Numéro de téléphone invalide") String telephone
) {}
