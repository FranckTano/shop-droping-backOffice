package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produit")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @SequenceGenerator(name = "produit_id_seq", sequenceName = "produit_id_seq", allocationSize = 50)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "produit_id_seq")
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(name = "prix_promo", precision = 10, scale = 2)
    private BigDecimal prixPromo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @Column(name = "image_principale", length = 500)
    private String imagePrincipale;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(name = "en_promotion", nullable = false)
    @Builder.Default
    private Boolean enPromotion = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean nouveau = false;

    @Column(length = 100)
    private String equipe;

    @Column(length = 20)
    private String saison;

    @Column(length = 50)
    private String marque;

    @Column(name = "couleurs_disponibles", length = 255)
    private String couleursDisponibles;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private long version;

    @PrePersist
    void beforeInsert() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void beforeUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
