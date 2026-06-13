package com.shopdropping.backoffice.repository;

import com.shopdropping.backoffice.entity.Commande;
import com.shopdropping.backoffice.entity.CommandeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {

    long countByStatut(CommandeStatus statut);

    @Query("select coalesce(sum(c.montantTotal), 0) from Commande c where c.statut in (" +
           "com.shopdropping.backoffice.entity.CommandeStatus.CONFIRMEE, " +
           "com.shopdropping.backoffice.entity.CommandeStatus.EN_COURS, " +
           "com.shopdropping.backoffice.entity.CommandeStatus.EXPEDIEE, " +
           "com.shopdropping.backoffice.entity.CommandeStatus.VALIDEE, " +
           "com.shopdropping.backoffice.entity.CommandeStatus.LIVREE)")
    BigDecimal sumChiffreAffaires();

    @Query("select coalesce(sum(c.montantTotal), 0) from Commande c where c.statut = com.shopdropping.backoffice.entity.CommandeStatus.LIVREE")
    BigDecimal sumChiffreAffairesLivrees();

    @Query(value = """
            select to_char(date_trunc('month', c.created_at), 'YYYY-MM') as mois,
                   coalesce(sum(c.montant_total), 0) as total
            from commande c
            where c.statut in ('CONFIRMEE', 'EN_COURS', 'EXPEDIEE', 'VALIDEE', 'LIVREE')
            group by date_trunc('month', c.created_at)
            order by date_trunc('month', c.created_at)
            """, nativeQuery = true)
    List<Object[]> chiffreAffairesParMois();

    @Query(value = """
            select to_char(date_trunc('day', c.created_at), 'YYYY-MM-DD') as jour,
                   count(c.id) as nb
            from commande c
            group by date_trunc('day', c.created_at)
            order by date_trunc('day', c.created_at)
            """, nativeQuery = true)
    List<Object[]> commandesParJour();

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit order by c.createdAt desc")
    List<Commande> findAllWithLignes();

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit where c.statut = :statut order by c.createdAt desc")
    List<Commande> findByStatutWithLignes(@Param("statut") CommandeStatus statut);

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit where c.id = :id")
    Optional<Commande> findByIdWithLignes(@Param("id") Long id);
}
