package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.config.CacheConfig;
import com.shopdropping.backoffice.dto.CreateProduitRequest;
import com.shopdropping.backoffice.dto.ProduitDto;
import com.shopdropping.backoffice.dto.UpdateProduitRequest;
import com.shopdropping.backoffice.entity.*;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CategorieRepository;
import com.shopdropping.backoffice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategorieRepository categorieRepository;
    private final AuditLogService auditLogService;

    @Cacheable(CacheConfig.CACHE_PRODUITS)
    public List<ProduitDto> findAll() {
        return productRepository.findAllWithCategorie().stream().map(this::toDto).toList();
    }

    @Cacheable(value = CacheConfig.CACHE_PRODUITS, key = "'actifs'")
    public List<ProduitDto> findActifs() {
        return productRepository.findActifsWithCategorie().stream().map(this::toDto).toList();
    }

    @Cacheable(value = CacheConfig.CACHE_PRODUITS, key = "'archives'")
    public List<ProduitDto> findArchives() {
        return productRepository.findArchivesWithCategorie().stream().map(this::toDto).toList();
    }

    public List<ProduitDto> rechercher(String q) {
        if (q == null || q.isBlank()) return findAll();
        return productRepository.rechercher(q).stream().map(this::toDto).toList();
    }

    @Cacheable(value = CacheConfig.CACHE_PRODUITS, key = "#id")
    public ProduitDto findById(Long id) {
        return toDto(productRepository.findByIdWithCategorie(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: " + id)));
    }

    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_PRODUITS, allEntries = true)
    public ProduitDto create(CreateProduitRequest request) {
        Categorie categorie = resolveCategorie(request.categorieId());
        Product product = Product.builder()
                .nom(request.nom())
                .description(request.description())
                .prix(request.prix())
                .prixPromo(request.prixPromo())
                .categorie(categorie)
                .imagePrincipale(request.imagePrincipale())
                .actif(true)
                .enPromotion(request.enPromotion() != null ? request.enPromotion() : false)
                .nouveau(request.nouveau() != null ? request.nouveau() : false)
                .equipe(request.equipe())
                .saison(request.saison())
                .marque(request.marque())
                .couleursDisponibles(request.couleursDisponibles())
                .build();
        ProduitDto result = toDto(productRepository.save(product));

        auditLogService.enregistrer(
                TypeAction.CREATION, TypeEntite.PRODUIT,
                result.id(), null,
                "Produit créé : " + request.nom()
        );
        return result;
    }

    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_PRODUITS, allEntries = true)
    public ProduitDto update(Long id, UpdateProduitRequest request) {
        Product product = productRepository.findByIdWithCategorie(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: " + id));

        if (request.nom()               != null) product.setNom(request.nom());
        if (request.description()       != null) product.setDescription(request.description());
        if (request.prix()              != null) product.setPrix(request.prix());
        if (request.prixPromo()         != null) product.setPrixPromo(request.prixPromo());
        if (request.categorieId()       != null) product.setCategorie(resolveCategorie(request.categorieId()));
        if (request.actif()             != null) product.setActif(request.actif());
        if (request.enPromotion()       != null) product.setEnPromotion(request.enPromotion());
        if (request.nouveau()           != null) product.setNouveau(request.nouveau());
        if (request.equipe()            != null) product.setEquipe(request.equipe());
        if (request.saison()            != null) product.setSaison(request.saison());
        if (request.marque()            != null) product.setMarque(request.marque());
        if (request.couleursDisponibles() != null) product.setCouleursDisponibles(request.couleursDisponibles());
        if (request.imagePrincipale()   != null) product.setImagePrincipale(request.imagePrincipale());

        ProduitDto result = toDto(productRepository.save(product));
        auditLogService.enregistrer(
                TypeAction.MODIFICATION, TypeEntite.PRODUIT,
                id, null,
                "Produit modifié : " + product.getNom()
        );
        return result;
    }

    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_PRODUITS, allEntries = true)
    public ProduitDto archiver(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: " + id));
        product.setActif(false);
        ProduitDto result = toDto(productRepository.save(product));
        auditLogService.enregistrer(TypeAction.MODIFICATION, TypeEntite.PRODUIT, id, null,
                "Produit archivé : " + product.getNom());
        return result;
    }

    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_PRODUITS, allEntries = true)
    public ProduitDto restaurer(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: " + id));
        product.setActif(true);
        ProduitDto result = toDto(productRepository.save(product));
        auditLogService.enregistrer(TypeAction.MODIFICATION, TypeEntite.PRODUIT, id, null,
                "Produit restauré : " + product.getNom());
        return result;
    }

    @Transactional
    @CacheEvict(value = CacheConfig.CACHE_PRODUITS, allEntries = true)
    public void supprimer(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produit introuvable: " + id));
        String nom = product.getNom();
        productRepository.deleteById(id);
        auditLogService.enregistrer(TypeAction.SUPPRESSION, TypeEntite.PRODUIT, id, null,
                "Produit supprimé : " + nom);
    }

    private Categorie resolveCategorie(Long categorieId) {
        if (categorieId == null) return null;
        return categorieRepository.findById(categorieId)
                .orElseThrow(() -> new NotFoundException("Catégorie introuvable: " + categorieId));
    }

    private ProduitDto toDto(Product p) {
        Long   catId  = p.getCategorie() != null ? p.getCategorie().getId()  : null;
        String catNom = p.getCategorie() != null ? p.getCategorie().getNom() : null;
        return new ProduitDto(
                p.getId(), p.getNom(), p.getDescription(),
                p.getPrix(), p.getPrixPromo(),
                catId, catNom,
                p.getImagePrincipale(),
                p.getActif(), p.getEnPromotion(), p.getNouveau(),
                p.getEquipe(), p.getSaison(), p.getMarque(),
                p.getCouleursDisponibles(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
