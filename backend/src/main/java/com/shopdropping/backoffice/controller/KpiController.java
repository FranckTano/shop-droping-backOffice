package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.DataPointDto;
import com.shopdropping.backoffice.dto.EvolutionMensuelleDto;
import com.shopdropping.backoffice.dto.RepartitionStatutDto;
import com.shopdropping.backoffice.dto.TopProduitDto;
import com.shopdropping.backoffice.service.KpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kpi")
@RequiredArgsConstructor
public class KpiController {

    private final KpiService kpiService;

    @GetMapping("/evolution-mensuelle")
    public List<EvolutionMensuelleDto> evolutionMensuelle() {
        return kpiService.getEvolutionMensuelle();
    }

    @GetMapping("/repartition-statuts")
    public List<RepartitionStatutDto> repartitionStatuts() {
        return kpiService.getRepartitionStatuts();
    }

    @GetMapping("/top-produits")
    public List<TopProduitDto> topProduits() {
        return kpiService.getTopProduits();
    }

    @GetMapping("/commandes-par-jour-semaine")
    public List<DataPointDto> commandesParJourSemaine() {
        return kpiService.getCommandesParJourSemaine();
    }
}
