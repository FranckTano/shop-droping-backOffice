package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.CommandeRecenteDto;
import com.shopdropping.backoffice.dto.DashboardStatsDto;
import com.shopdropping.backoffice.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDto stats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return dashboardService.getStats(dateDebut, dateFin);
    }

    @GetMapping("/commandes-recentes")
    public List<CommandeRecenteDto> commandesRecentes() {
        return dashboardService.getCommandesRecentes();
    }
}
