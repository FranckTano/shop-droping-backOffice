package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CategorieDto;
import com.shopdropping.backoffice.entity.Categorie;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CategorieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategorieService — tests unitaires")
class CategorieServiceTest {

    @Mock CategorieRepository categorieRepository;
    @InjectMocks CategorieService categorieService;

    private Categorie categorieTest;

    @BeforeEach
    void setUp() {
        categorieTest = Categorie.builder()
                .id(1L)
                .nom("Maillots Collection")
                .description("Maillots de collection toutes équipes")
                .imageUrl("https://res.cloudinary.com/test/image/upload/cat.jpg")
                .actif(true)
                .build();
    }

    // ── findAll ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll() retourne toutes les catégories")
    void findAll_retourne_toutes_categories() {
        when(categorieRepository.findAll()).thenReturn(List.of(categorieTest));

        List<CategorieDto> result = categorieService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nom()).isEqualTo("Maillots Collection");
        assertThat(result.get(0).actif()).isTrue();
    }

    @Test
    @DisplayName("findAll() retourne liste vide si aucune catégorie")
    void findAll_retourne_liste_vide() {
        when(categorieRepository.findAll()).thenReturn(List.of());

        assertThat(categorieService.findAll()).isEmpty();
    }

    // ── findById ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById() retourne la catégorie existante")
    void findById_retourne_categorie_existante() {
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorieTest));

        CategorieDto result = categorieService.findById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.nom()).isEqualTo("Maillots Collection");
    }

    @Test
    @DisplayName("findById() lève NotFoundException si catégorie absente")
    void findById_leve_exception_si_absente() {
        when(categorieRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categorieService.findById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── create ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("create() crée une nouvelle catégorie")
    void create_nouvelle_categorie() {
        CategorieDto request = new CategorieDto(null, "Vintage", "Maillots vintage", null, true);

        when(categorieRepository.existsByNom("Vintage")).thenReturn(false);
        when(categorieRepository.save(any(Categorie.class))).thenReturn(
                Categorie.builder().id(2L).nom("Vintage").actif(true).build()
        );

        CategorieDto result = categorieService.create(request);

        assertThat(result.id()).isEqualTo(2L);
        assertThat(result.nom()).isEqualTo("Vintage");
        verify(categorieRepository).save(any(Categorie.class));
    }

    @Test
    @DisplayName("create() lève IllegalArgumentException si nom dupliqué")
    void create_leve_exception_si_nom_duplique() {
        CategorieDto request = new CategorieDto(null, "Maillots Collection", null, null, true);
        when(categorieRepository.existsByNom("Maillots Collection")).thenReturn(true);

        assertThatThrownBy(() -> categorieService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("existe déjà");

        verify(categorieRepository, never()).save(any());
    }

    // ── update ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("update() modifie le nom et la description")
    void update_modifie_nom_et_description() {
        CategorieDto request = new CategorieDto(null, "Vintage Court", "Maillots vintage court", null, null);
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorieTest));
        when(categorieRepository.save(any())).thenReturn(categorieTest);

        categorieService.update(1L, request);

        verify(categorieRepository).save(argThat(c ->
                c.getNom().equals("Vintage Court") &&
                c.getDescription().equals("Maillots vintage court")
        ));
    }

    @Test
    @DisplayName("update() lève NotFoundException si catégorie absente")
    void update_leve_exception_si_absente() {
        CategorieDto request = new CategorieDto(null, "Nouveau nom", null, null, null);
        when(categorieRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categorieService.update(99L, request))
                .isInstanceOf(NotFoundException.class);
    }

    // ── delete ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete() supprime la catégorie existante")
    void delete_supprime_categorie_existante() {
        when(categorieRepository.existsById(1L)).thenReturn(true);

        categorieService.delete(1L);

        verify(categorieRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete() lève NotFoundException si catégorie absente")
    void delete_leve_exception_si_absente() {
        when(categorieRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> categorieService.delete(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");

        verify(categorieRepository, never()).deleteById(any());
    }
}
