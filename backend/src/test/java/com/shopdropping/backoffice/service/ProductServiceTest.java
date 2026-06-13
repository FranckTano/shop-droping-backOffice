package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CreateProduitRequest;
import com.shopdropping.backoffice.dto.ProduitDto;
import com.shopdropping.backoffice.dto.UpdateProduitRequest;
import com.shopdropping.backoffice.entity.Categorie;
import com.shopdropping.backoffice.entity.Product;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CategorieRepository;
import com.shopdropping.backoffice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService — tests unitaires")
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock CategorieRepository categorieRepository;
    @InjectMocks ProductService productService;

    private Categorie categorieTest;
    private Product produitTest;

    @BeforeEach
    void setUp() {
        categorieTest = Categorie.builder()
                .id(1L).nom("Maillots Collection").actif(true).build();

        produitTest = Product.builder()
                .id(10L)
                .nom("Maillot Barcelona Home 2024")
                .description("Maillot officiel FC Barcelona")
                .prix(new BigDecimal("19500"))
                .prixPromo(new BigDecimal("17000"))
                .categorie(categorieTest)
                .imagePrincipale("https://res.cloudinary.com/test/image/upload/test.jpg")
                .actif(true)
                .enPromotion(false)
                .nouveau(true)
                .equipe("FC Barcelona")
                .saison("2024-2025")
                .marque("Nike")
                .couleursDisponibles("Rouge,Bleu")
                .build();
    }

    // ── findAll ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll() retourne la liste complète des produits")
    void findAll_retourne_liste_complete() {
        when(productRepository.findAllWithCategorie()).thenReturn(List.of(produitTest));

        List<ProduitDto> result = productService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nom()).isEqualTo("Maillot Barcelona Home 2024");
        assertThat(result.get(0).prix()).isEqualByComparingTo("19500");
        verify(productRepository).findAllWithCategorie();
    }

    @Test
    @DisplayName("findAll() retourne liste vide si aucun produit")
    void findAll_retourne_liste_vide() {
        when(productRepository.findAllWithCategorie()).thenReturn(List.of());

        List<ProduitDto> result = productService.findAll();

        assertThat(result).isEmpty();
    }

    // ── findActifs ───────────────────────────────────────────────────────

    @Test
    @DisplayName("findActifs() retourne uniquement les produits actifs")
    void findActifs_retourne_produits_actifs() {
        when(productRepository.findActifsWithCategorie()).thenReturn(List.of(produitTest));

        List<ProduitDto> result = productService.findActifs();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).actif()).isTrue();
    }

    // ── findById ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById() retourne le produit si existant")
    void findById_retourne_produit_existant() {
        when(productRepository.findByIdWithCategorie(10L)).thenReturn(Optional.of(produitTest));

        ProduitDto result = productService.findById(10L);

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.nom()).isEqualTo("Maillot Barcelona Home 2024");
        assertThat(result.categorieId()).isEqualTo(1L);
        assertThat(result.categorieNom()).isEqualTo("Maillots Collection");
    }

    @Test
    @DisplayName("findById() lève NotFoundException si produit absent")
    void findById_leve_exception_si_absent() {
        when(productRepository.findByIdWithCategorie(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── create ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("create() crée et retourne le produit avec catégorie")
    void create_avec_categorie_retourne_produit() {
        CreateProduitRequest request = new CreateProduitRequest(
                "Maillot PSG Home 2024",
                "Maillot officiel PSG",
                new BigDecimal("22000"),
                new BigDecimal("19000"),
                1L, false, true,
                "PSG", "2024-2025", "Nike",
                "Rouge,Bleu",
                "https://res.cloudinary.com/test/image/upload/psg.jpg"
        );
        Product savedProduit = Product.builder()
                .id(11L).nom("Maillot PSG Home 2024")
                .prix(new BigDecimal("22000"))
                .categorie(categorieTest).actif(true)
                .enPromotion(false).nouveau(true).build();

        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorieTest));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduit);

        ProduitDto result = productService.create(request);

        assertThat(result.nom()).isEqualTo("Maillot PSG Home 2024");
        assertThat(result.actif()).isTrue();
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("create() sans catégorie crée le produit")
    void create_sans_categorie_retourne_produit() {
        CreateProduitRequest request = new CreateProduitRequest(
                "Maillot Test", "Desc", new BigDecimal("15000"),
                null, null, false, false,
                "Équipe Test", "2024", "Marque", "Blanc", null
        );
        Product savedProduit = Product.builder()
                .id(12L).nom("Maillot Test").prix(new BigDecimal("15000"))
                .actif(true).enPromotion(false).nouveau(false).build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduit);

        ProduitDto result = productService.create(request);

        assertThat(result.nom()).isEqualTo("Maillot Test");
        assertThat(result.categorieId()).isNull();
        verify(categorieRepository, never()).findById(any());
    }

    @Test
    @DisplayName("create() lève NotFoundException si catégorie introuvable")
    void create_leve_exception_si_categorie_absente() {
        CreateProduitRequest request = new CreateProduitRequest(
                "Produit", "Desc", new BigDecimal("10000"),
                null, 999L, false, false,
                null, null, null, null, null
        );
        when(categorieRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("999");
    }

    // ── update ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("update() modifie le nom et le prix du produit")
    void update_modifie_nom_et_prix() {
        UpdateProduitRequest request = new UpdateProduitRequest(
                "Maillot Barcelona Away 2024",
                null, new BigDecimal("21000"),
                null, null, null, null,
                null, null, null, null, null
        );
        when(productRepository.findByIdWithCategorie(10L)).thenReturn(Optional.of(produitTest));
        when(productRepository.save(any(Product.class))).thenReturn(produitTest);

        ProduitDto result = productService.update(10L, request);

        verify(productRepository).save(argThat(p ->
                p.getNom().equals("Maillot Barcelona Away 2024") &&
                p.getPrix().compareTo(new BigDecimal("21000")) == 0
        ));
    }

    @Test
    @DisplayName("update() lève NotFoundException si produit absent")
    void update_leve_exception_si_absent() {
        UpdateProduitRequest request = new UpdateProduitRequest(
                "Nouveau nom", null, null, null, null,
                null, null, null, null, null, null, null
        );
        when(productRepository.findByIdWithCategorie(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.update(99L, request))
                .isInstanceOf(NotFoundException.class);
    }

    // ── archiver ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("archiver() passe le produit à actif=false (soft delete)")
    void archiver_passe_produit_inactif() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(produitTest));
        when(productRepository.save(any())).thenReturn(produitTest);

        productService.archiver(10L);

        verify(productRepository).save(argThat(p -> !p.getActif()));
    }

    @Test
    @DisplayName("archiver() lève NotFoundException si produit absent")
    void archiver_leve_exception_si_absent() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.archiver(99L))
                .isInstanceOf(NotFoundException.class);
    }

    // ── restaurer ────────────────────────────────────────────────────────

    @Test
    @DisplayName("restaurer() passe le produit à actif=true")
    void restaurer_passe_produit_actif() {
        produitTest.setActif(false);
        when(productRepository.findById(10L)).thenReturn(Optional.of(produitTest));
        when(productRepository.save(any())).thenReturn(produitTest);

        productService.restaurer(10L);

        verify(productRepository).save(argThat(Product::getActif));
    }

    @Test
    @DisplayName("restaurer() lève NotFoundException si produit absent")
    void restaurer_leve_exception_si_absent() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.restaurer(99L))
                .isInstanceOf(NotFoundException.class);
    }

    // ── rechercher ───────────────────────────────────────────────────────

    @Test
    @DisplayName("rechercher() avec terme vide retourne tous les produits")
    void rechercher_terme_vide_retourne_tous() {
        when(productRepository.findAllWithCategorie()).thenReturn(List.of(produitTest));

        List<ProduitDto> result = productService.rechercher("  ");

        assertThat(result).hasSize(1);
        verify(productRepository).findAllWithCategorie();
        verify(productRepository, never()).rechercher(anyString());
    }

    @Test
    @DisplayName("rechercher() avec terme retourne produits filtrés")
    void rechercher_terme_retourne_filtres() {
        when(productRepository.rechercher("Barcelona")).thenReturn(List.of(produitTest));

        List<ProduitDto> result = productService.rechercher("Barcelona");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).equipe()).isEqualTo("FC Barcelona");
        verify(productRepository).rechercher("Barcelona");
    }
}
