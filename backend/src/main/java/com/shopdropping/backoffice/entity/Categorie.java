package com.shopdropping.backoffice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categorie")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categorie {

    @Id
    @SequenceGenerator(name = "categorie_id_seq", sequenceName = "categorie_id_seq", allocationSize = 50)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "categorie_id_seq")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Version
    private long version;
}
