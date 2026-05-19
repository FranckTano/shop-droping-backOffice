package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commande")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Commande {

    @Id
    @SequenceGenerator(name = "commande_id_seq", sequenceName = "commande_id_seq", allocationSize = 50)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "commande_id_seq")
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String numero;

    @Column(name = "client_nom", nullable = false, length = 100)
    private String clientNom;

    @Column(name = "client_telephone", nullable = false, length = 50)
    private String clientTelephone;

    @Column(name = "client_email", length = 100)
    private String clientEmail;

    @Column(name = "client_adresse", columnDefinition = "TEXT")
    private String clientAdresse;

    @Column(name = "montant_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private CommandeStatus statut = CommandeStatus.EN_ATTENTE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "whatsapp_message_sent")
    @Builder.Default
    private Boolean whatsappMessageSent = false;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<LigneCommande> lignes = new ArrayList<>();

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
