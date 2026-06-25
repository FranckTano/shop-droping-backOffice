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

    long countByCreatedAtBetween(java.time.LocalDateTime debut, java.time.LocalDateTime fin);

    long countByStatutAndCreatedAtBetween(CommandeStatus statut, java.time.LocalDateTime debut, java.time.LocalDateTime fin);

    @Query("select coalesce(sum(c.montantTotal), 0) from Commande c where c.statut = com.shopdropping.backoffice.entity.CommandeStatus.CONFIRMEE and c.createdAt between :debut and :fin")
    BigDecimal sumChiffreAffairesByPeriode(@Param("debut") java.time.LocalDateTime debut, @Param("fin") java.time.LocalDateTime fin);

    @Query("select coalesce(sum(c.montantTotal), 0) from Commande c where c.statut = com.shopdropping.backoffice.entity.CommandeStatus.CONFIRMEE")
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

    // ── KPI : évolution mensuelle complète (12 derniers mois) ──────────────────────
    @Query(value = """
            SELECT
                to_char(date_trunc('month', created_at), 'YYYY-MM')  AS mois,
                COUNT(*)                                               AS total_commandes,
                COUNT(*) FILTER (WHERE statut = 'CONFIRMEE')          AS confirmees,
                COUNT(*) FILTER (WHERE statut = 'ANNULEE')            AS annulees,
                COUNT(*) FILTER (WHERE statut = 'LIVREE')             AS livrees,
                COALESCE(SUM(montant_total) FILTER (WHERE statut = 'CONFIRMEE'), 0) AS ca_confirmees
            FROM commande
            WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '11 months'
            GROUP BY date_trunc('month', created_at)
            ORDER BY date_trunc('month', created_at)
            """, nativeQuery = true)
    List<Object[]> evolutionMensuelle();

    // ── KPI : répartition par statut ───────────────────────────────────────────────
    @Query(value = """
            SELECT statut, COUNT(*) AS nb
            FROM commande
            GROUP BY statut
            ORDER BY nb DESC
            """, nativeQuery = true)
    List<Object[]> repartitionParStatut();

    // ── KPI : top 10 produits par CA (commandes CONFIRMEE) ─────────────────────────
    @Query(value = """
            SELECT p.nom,
                   COALESCE(SUM(lc.quantite), 0)    AS total_vendu,
                   COALESCE(SUM(lc.prix_total), 0)  AS ca_total
            FROM ligne_commande lc
            JOIN produit p  ON lc.produit_id  = p.id
            JOIN commande c ON lc.commande_id = c.id
            WHERE c.statut = 'CONFIRMEE'
            GROUP BY p.id, p.nom
            ORDER BY ca_total DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> topProduits();

    // ── KPI : commandes par jour de semaine (pour heatmap) ─────────────────────────
    @Query(value = """
            SELECT TRIM(TO_CHAR(created_at, 'Day')) AS jour,
                   COUNT(*)                          AS nb
            FROM commande
            WHERE created_at >= NOW() - INTERVAL '90 days'
            GROUP BY TO_CHAR(created_at, 'D'), TRIM(TO_CHAR(created_at, 'Day'))
            ORDER BY TO_CHAR(created_at, 'D')
            """, nativeQuery = true)
    List<Object[]> commandesParJourSemaine();

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit order by c.createdAt desc")
    List<Commande> findAllWithLignes();

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit where c.statut = :statut order by c.createdAt desc")
    List<Commande> findByStatutWithLignes(@Param("statut") CommandeStatus statut);

    @Query("select distinct c from Commande c left join fetch c.lignes l left join fetch l.produit where c.id = :id")
    Optional<Commande> findByIdWithLignes(@Param("id") Long id);
}
