package com.shopdropping.backoffice.dto;

import java.math.BigDecimal;

public record TopProduitDto(String nom, long totalVendu, BigDecimal caTotal) {}
