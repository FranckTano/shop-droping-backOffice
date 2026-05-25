package com.shopdropping.backoffice.repository;

import com.shopdropping.backoffice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActifTrue();
    List<Product> findByActifFalse();
    long countByActifTrue();
    long countByActifFalse();

    @Query("select p from Product p left join fetch p.categorie order by p.createdAt desc")
    List<Product> findAllWithCategorie();

    @Query("select p from Product p left join fetch p.categorie where p.actif = true order by p.createdAt desc")
    List<Product> findActifsWithCategorie();

    @Query("select p from Product p left join fetch p.categorie where p.actif = false order by p.createdAt desc")
    List<Product> findArchivesWithCategorie();

    @Query("select p from Product p left join fetch p.categorie where p.id = :id")
    Optional<Product> findByIdWithCategorie(Long id);

    @Query("select p from Product p left join fetch p.categorie where " +
           "lower(p.nom) like lower(concat('%', :q, '%')) or " +
           "lower(p.equipe) like lower(concat('%', :q, '%')) or " +
           "lower(p.marque) like lower(concat('%', :q, '%')) " +
           "order by p.createdAt desc")
    List<Product> rechercher(@Param("q") String q);
}
