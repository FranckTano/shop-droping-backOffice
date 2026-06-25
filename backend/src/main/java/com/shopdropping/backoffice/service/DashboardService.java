package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CommandeRecenteDto;
import com.shopdropping.backoffice.dto.DashboardStatsDto;
import com.shopdropping.backoffice.dto.DataPointDto;
import com.shopdropping.backoffice.entity.CommandeStatus;
import com.shopdropping.backoffice.repository.CommandeRepository;
import com.shopdropping.backoffice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CommandeRepository commandeRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats(LocalDate dateDebut, LocalDate dateFin) {
        long totalCommandes;
        long enAttente, confirmees, enCours, expediees, validees, livrees, annulees, standby;
        BigDecimal ca, caLivrees;

        if (dateDebut != null && dateFin != null) {
            LocalDateTime debut = dateDebut.atStartOfDay();
            LocalDateTime fin   = dateFin.atTime(LocalTime.MAX);
            totalCommandes = commandeRepository.countByCreatedAtBetween(debut, fin);
            enAttente  = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.EN_ATTENTE,  debut, fin);
            confirmees = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.CONFIRMEE,  debut, fin);
            enCours    = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.EN_COURS,   debut, fin);
            expediees  = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.EXPEDIEE,   debut, fin);
            validees   = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.VALIDEE,    debut, fin);
            livrees    = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.LIVREE,     debut, fin);
            annulees   = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.ANNULEE,    debut, fin);
            standby    = commandeRepository.countByStatutAndCreatedAtBetween(CommandeStatus.STANDBY,    debut, fin);
            ca         = commandeRepository.sumChiffreAffairesByPeriode(debut, fin);
            caLivrees  = BigDecimal.ZERO;
        } else {
            totalCommandes = commandeRepository.count();
            enAttente  = commandeRepository.countByStatut(CommandeStatus.EN_ATTENTE);
            confirmees = commandeRepository.countByStatut(CommandeStatus.CONFIRMEE);
            enCours    = commandeRepository.countByStatut(CommandeStatus.EN_COURS);
            expediees  = commandeRepository.countByStatut(CommandeStatus.EXPEDIEE);
            validees   = commandeRepository.countByStatut(CommandeStatus.VALIDEE);
            livrees    = commandeRepository.countByStatut(CommandeStatus.LIVREE);
            annulees   = commandeRepository.countByStatut(CommandeStatus.ANNULEE);
            standby    = commandeRepository.countByStatut(CommandeStatus.STANDBY);
            ca         = commandeRepository.sumChiffreAffaires();
            caLivrees  = commandeRepository.sumChiffreAffairesLivrees();
        }

        long totalProduits = productRepository.count();
        long produitsActifs = productRepository.countByActifTrue();
        long produitsArchives = productRepository.countByActifFalse();

        List<DataPointDto> commandesParJour = commandeRepository.commandesParJour().stream()
                .map(r -> new DataPointDto(String.valueOf(r[0]), ((Number) r[1]).doubleValue()))
                .toList();

        List<DataPointDto> caParMois = commandeRepository.chiffreAffairesParMois().stream()
                .map(r -> new DataPointDto(String.valueOf(r[0]), ((Number) r[1]).doubleValue()))
                .toList();

        return new DashboardStatsDto(
                totalCommandes, enAttente, confirmees, enCours, expediees, validees, livrees, annulees, standby,
                ca, caLivrees,
                totalProduits, produitsActifs, produitsArchives,
                commandesParJour, caParMois
        );
    }

    @Transactional(readOnly = true)
    public List<CommandeRecenteDto> getCommandesRecentes() {
        return commandeRepository
                .findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(c -> new CommandeRecenteDto(
                        c.getId(), c.getNumero(), c.getClientNom(), c.getClientTelephone(),
                        c.getMontantTotal(), c.getStatut(), c.getCreatedAt()))
                .toList();
    }
}
