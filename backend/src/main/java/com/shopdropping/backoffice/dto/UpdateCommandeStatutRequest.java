package com.shopdropping.backoffice.dto;

import com.shopdropping.backoffice.entity.CommandeStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCommandeStatutRequest(@NotNull CommandeStatus statut) {}
