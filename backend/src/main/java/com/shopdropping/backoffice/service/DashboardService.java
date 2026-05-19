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
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CommandeRepository commandeRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long totalCommandes = commandeRepository.count();
        long enAttente = commandeRepository.countByStatut(CommandeStatus.EN_ATTENTE);
        long validees = commandeRepository.countByStatut(CommandeStatus.VALIDEE);
        long livrees = commandeRepository.countByStatut(CommandeStatus.LIVREE);
        long annulees = commandeRepository.countByStatut(CommandeStatus.ANNULEE);
        long standby = commandeRepository.countByStatut(CommandeStatus.STANDBY);
        BigDecimal ca = commandeRepository.sumChiffreAffaires();
        BigDecimal caLivrees = commandeRepository.sumChiffreAffairesLivrees();

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
                totalCommandes, enAttente, validees, livrees, annulees, standby,
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
