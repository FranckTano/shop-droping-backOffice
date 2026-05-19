package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.CategorieDto;
import com.shopdropping.backoffice.service.CategorieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping
    public List<CategorieDto> findAll() {
        return categorieService.findAll();
    }

    @GetMapping("/{id}")
    public CategorieDto findById(@PathVariable Long id) {
        return categorieService.findById(id);
    }

    @PostMapping
    public ResponseEntity<CategorieDto> create(@Valid @RequestBody CategorieDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categorieService.create(request));
    }

    @PutMapping("/{id}")
    public CategorieDto update(@PathVariable Long id, @RequestBody CategorieDto request) {
        return categorieService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categorieService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
