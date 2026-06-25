package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_audit_log_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_audit_log_admin_username", columnList = "admin_username"),
        @Index(name = "idx_audit_log_type_entite", columnList = "type_entite")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "audit_log_seq")
    @SequenceGenerator(name = "audit_log_seq", sequenceName = "audit_log_seq", allocationSize = 1)
    private Long id;

    @Column(name = "admin_username", nullable = false, length = 100)
    private String adminUsername;

    @Column(name = "admin_nom", length = 200)
    private String adminNom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_action", nullable = false, length = 30)
    private TypeAction typeAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_entite", nullable = false, length = 30)
    private TypeEntite typeEntite;

    @Column(name = "entite_id")
    private Long entiteId;

    @Column(name = "entite_reference", length = 100)
    private String entiteReference;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
