package com.shopdropping.backoffice.repository;

import com.shopdropping.backoffice.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    Optional<Categorie> findByNom(String nom);
    boolean existsByNom(String nom);
}
