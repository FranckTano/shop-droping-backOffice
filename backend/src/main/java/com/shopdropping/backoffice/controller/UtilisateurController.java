package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.CreateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UpdateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UtilisateurDto;
import com.shopdropping.backoffice.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    public List<UtilisateurDto> findAll() {
        return utilisateurService.findAll();
    }

    @GetMapping("/{id}")
    public UtilisateurDto findById(@PathVariable Long id) {
        return utilisateurService.findById(id);
    }

    @PostMapping
    public ResponseEntity<UtilisateurDto> create(@Valid @RequestBody CreateUtilisateurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurService.create(request));
    }

    @PutMapping("/{id}")
    public UtilisateurDto update(@PathVariable Long id, @Valid @RequestBody UpdateUtilisateurRequest request) {
        return utilisateurService.update(id, request);
    }

    @PatchMapping("/{id}/statut")
    public UtilisateurDto changerStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return utilisateurService.changerStatut(id, body.get("statut"));
    }

    @PatchMapping("/{id}/definir-admin-actif")
    public UtilisateurDto definirAdminActif(@PathVariable Long id) {
        return utilisateurService.definirAdminActif(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}


