package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @SequenceGenerator(name = "utilisateur_id_seq", sequenceName = "utilisateur_id_seq", allocationSize = 50)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "utilisateur_id_seq")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenoms;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String statut = "ACTIF";

    @Column(length = 20)
    private String telephone;

    // L'admin dont le numéro reçoit les commandes des clients (un seul à la fois)
    @Column(name = "recevoir_commandes", columnDefinition = "boolean default false not null")
    @Builder.Default
    private Boolean recevoirCommandes = false;

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
