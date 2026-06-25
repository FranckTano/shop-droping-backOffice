package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.EvolutionMensuelleDto;
import com.shopdropping.backoffice.dto.RepartitionStatutDto;
import com.shopdropping.backoffice.dto.TopProduitDto;
import com.shopdropping.backoffice.repository.CommandeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KpiService {

    private final CommandeRepository commandeRepository;

    @Transactional(readOnly = true)
    public List<EvolutionMensuelleDto> getEvolutionMensuelle() {
        return commandeRepository.evolutionMensuelle().stream()
                .map(r -> new EvolutionMensuelleDto(
                        String.valueOf(r[0]),
                        ((Number) r[1]).longValue(),
                        ((Number) r[2]).longValue(),
                        ((Number) r[3]).longValue(),
                        ((Number) r[4]).longValue(),
                        new BigDecimal(String.valueOf(r[5]))
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepartitionStatutDto> getRepartitionStatuts() {
        return commandeRepository.repartitionParStatut().stream()
                .map(r -> new RepartitionStatutDto(
                        String.valueOf(r[0]),
                        ((Number) r[1]).longValue()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopProduitDto> getTopProduits() {
        return commandeRepository.topProduits().stream()
                .map(r -> new TopProduitDto(
                        String.valueOf(r[0]),
                        ((Number) r[1]).longValue(),
                        new BigDecimal(String.valueOf(r[2]))
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<com.shopdropping.backoffice.dto.DataPointDto> getCommandesParJourSemaine() {
        return commandeRepository.commandesParJourSemaine().stream()
                .map(r -> new com.shopdropping.backoffice.dto.DataPointDto(
                        String.valueOf(r[0]),
                        ((Number) r[1]).doubleValue()
                ))
                .toList();
    }
}
