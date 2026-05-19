package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ligne_commande")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LigneCommande {

    @Id
    @SequenceGenerator(name = "ligne_commande_id_seq", sequenceName = "ligne_commande_id_seq", allocationSize = 50)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ligne_commande_id_seq")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Commande commande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product produit;

    @Column(nullable = false, length = 10)
    private String taille;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String couleur = "Standard";

    @Column(nullable = false)
    @Builder.Default
    private Integer quantite = 1;

    @Column(name = "prix_unitaire", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(name = "prix_options_unitaire", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal prixOptionsUnitaire = BigDecimal.ZERO;

    @Column(name = "badges_officiels", nullable = false)
    @Builder.Default
    private Boolean badgesOfficiels = false;

    @Column(name = "flocage", nullable = false)
    @Builder.Default
    private Boolean flocage = false;

    @Column(name = "flocage_nom", length = 100)
    private String flocageNom;

    @Column(name = "flocage_numero", length = 20)
    private String flocageNumero;

    @Column(name = "prix_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixTotal;
}
