package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.CreateProduitRequest;
import com.shopdropping.backoffice.dto.ProduitDto;
import com.shopdropping.backoffice.dto.UpdateProduitRequest;
import com.shopdropping.backoffice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/produits")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProduitDto> findAll() {
        return productService.findAll();
    }

    @GetMapping("/actifs")
    public List<ProduitDto> findActifs() {
        return productService.findActifs();
    }

    @GetMapping("/archives")
    public List<ProduitDto> findArchives() {
        return productService.findArchives();
    }

    @GetMapping("/{id}")
    public ProduitDto findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProduitDto> create(@Valid @RequestBody CreateProduitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ProduitDto update(@PathVariable Long id, @RequestBody UpdateProduitRequest request) {
        return productService.update(id, request);
    }

    @PatchMapping("/{id}/restaurer")
    public ProduitDto restaurer(@PathVariable Long id) {
        return productService.restaurer(id);
    }

    // DELETE = soft delete (archive), matching Angular AdminProduitService.archiver()
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> archiver(@PathVariable Long id) {
        productService.archiver(id);
        return ResponseEntity.noContent().build();
    }
}
