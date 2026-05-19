package com.shopdropping.backoffice.dto;

public record UpdateUtilisateurRequest(
        String password,
        String nom,
        String prenoms,
        String role,
        String statut
) {}
