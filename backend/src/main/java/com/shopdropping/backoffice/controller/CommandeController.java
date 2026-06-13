package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.CommandeDto;
import com.shopdropping.backoffice.dto.UpdateCommandeStatutRequest;
import com.shopdropping.backoffice.entity.CommandeStatus;
import com.shopdropping.backoffice.service.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping
    public List<CommandeDto> findAll(@RequestParam(required = false) CommandeStatus statut) {
        return commandeService.findAll(statut);
    }

    @GetMapping("/statut/{statut}")
    public List<CommandeDto> findByStatut(@PathVariable CommandeStatus statut) {
        return commandeService.findAll(statut);
    }

    @GetMapping("/{id}")
    public CommandeDto findById(@PathVariable Long id) {
        return commandeService.findById(id);
    }

    @PatchMapping("/{id}/statut")
    public CommandeDto updateStatut(@PathVariable Long id,
                                    @RequestBody Map<String, String> body) {
        CommandeStatus statut = CommandeStatus.valueOf(body.get("statut"));
        return commandeService.updateStatut(id, new UpdateCommandeStatutRequest(statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        commandeService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
