package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CategorieDto;
import com.shopdropping.backoffice.entity.Categorie;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorieService {

    private final CategorieRepository categorieRepository;

    public List<CategorieDto> findAll() {
        return categorieRepository.findAll().stream().map(this::toDto).toList();
    }

    public CategorieDto findById(Long id) {
        return toDto(categorieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable: " + id)));
    }

    @Transactional
    public CategorieDto create(CategorieDto request) {
        if (categorieRepository.existsByNom(request.nom())) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà");
        }
        Categorie categorie = Categorie.builder()
                .nom(request.nom())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .actif(request.actif() != null ? request.actif() : true)
                .build();
        return toDto(categorieRepository.save(categorie));
    }

    @Transactional
    public CategorieDto update(Long id, CategorieDto request) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable: " + id));

        if (request.nom() != null) categorie.setNom(request.nom());
        if (request.description() != null) categorie.setDescription(request.description());
        if (request.imageUrl() != null) categorie.setImageUrl(request.imageUrl());
        if (request.actif() != null) categorie.setActif(request.actif());

        return toDto(categorieRepository.save(categorie));
    }

    @Transactional
    public void delete(Long id) {
        if (!categorieRepository.existsById(id)) {
            throw new NotFoundException("Catégorie introuvable: " + id);
        }
        categorieRepository.deleteById(id);
    }

    private CategorieDto toDto(Categorie c) {
        return new CategorieDto(c.getId(), c.getNom(), c.getDescription(), c.getImageUrl(), c.getActif());
    }
}
