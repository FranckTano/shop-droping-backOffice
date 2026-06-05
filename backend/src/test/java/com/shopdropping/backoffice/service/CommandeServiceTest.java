package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CommandeDto;
import com.shopdropping.backoffice.dto.UpdateCommandeStatutRequest;
import com.shopdropping.backoffice.entity.Commande;
import com.shopdropping.backoffice.entity.CommandeStatus;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CommandeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CommandeService — tests unitaires")
class CommandeServiceTest {

    @Mock CommandeRepository commandeRepository;
    @InjectMocks CommandeService commandeService;

    private Commande commandeTest;

    @BeforeEach
    void setUp() {
        commandeTest = Commande.builder()
                .id(1L)
                .numero("CMD-20260604-ABCD")
                .clientNom("Franck Tano")
                .clientTelephone("+2250596282556")
                .clientEmail("franck@test.com")
                .clientAdresse("Abidjan, Cocody")
                .montantTotal(new BigDecimal("27500"))
                .statut(CommandeStatus.EN_ATTENTE)
                .notes("Livraison rapide svp")
                .whatsappMessageSent(false)
                .lignes(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ── findAll ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll(null) retourne toutes les commandes")
    void findAll_sans_filtre_retourne_toutes() {
        when(commandeRepository.findAllWithLignes()).thenReturn(List.of(commandeTest));

        List<CommandeDto> result = commandeService.findAll(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).clientNom()).isEqualTo("Franck Tano");
        assertThat(result.get(0).statut()).isEqualTo(CommandeStatus.EN_ATTENTE);
        verify(commandeRepository).findAllWithLignes();
        verify(commandeRepository, never()).findByStatutWithLignes(any());
    }

    @Test
    @DisplayName("findAll(EN_ATTENTE) retourne les commandes en attente")
    void findAll_avec_filtre_statut() {
        when(commandeRepository.findByStatutWithLignes(CommandeStatus.EN_ATTENTE))
                .thenReturn(List.of(commandeTest));

        List<CommandeDto> result = commandeService.findAll(CommandeStatus.EN_ATTENTE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).statut()).isEqualTo(CommandeStatus.EN_ATTENTE);
        verify(commandeRepository).findByStatutWithLignes(CommandeStatus.EN_ATTENTE);
        verify(commandeRepository, never()).findAllWithLignes();
    }

    @Test
    @DisplayName("findAll() retourne liste vide si aucune commande")
    void findAll_retourne_liste_vide() {
        when(commandeRepository.findAllWithLignes()).thenReturn(List.of());

        assertThat(commandeService.findAll(null)).isEmpty();
    }

    // ── findById ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById() retourne la commande avec ses lignes")
    void findById_retourne_commande_existante() {
        when(commandeRepository.findByIdWithLignes(1L)).thenReturn(Optional.of(commandeTest));

        CommandeDto result = commandeService.findById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.numero()).isEqualTo("CMD-20260604-ABCD");
        assertThat(result.montantTotal()).isEqualByComparingTo("27500");
        assertThat(result.lignes()).isEmpty();
    }

    @Test
    @DisplayName("findById() lève NotFoundException si commande absente")
    void findById_leve_exception_si_absente() {
        when(commandeRepository.findByIdWithLignes(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandeService.findById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── updateStatut ─────────────────────────────────────────────────────

    @Test
    @DisplayName("updateStatut() passe la commande à VALIDEE")
    void updateStatut_passe_commande_validee() {
        UpdateCommandeStatutRequest request = new UpdateCommandeStatutRequest(CommandeStatus.VALIDEE);
        when(commandeRepository.findById(1L)).thenReturn(Optional.of(commandeTest));
        when(commandeRepository.save(any(Commande.class))).thenReturn(commandeTest);

        commandeService.updateStatut(1L, request);

        verify(commandeRepository).save(argThat(c ->
                c.getStatut() == CommandeStatus.VALIDEE
        ));
    }

    @Test
    @DisplayName("updateStatut() passe la commande à LIVREE")
    void updateStatut_passe_commande_livree() {
        UpdateCommandeStatutRequest request = new UpdateCommandeStatutRequest(CommandeStatus.LIVREE);
        when(commandeRepository.findById(1L)).thenReturn(Optional.of(commandeTest));
        when(commandeRepository.save(any(Commande.class))).thenReturn(commandeTest);

        commandeService.updateStatut(1L, request);

        verify(commandeRepository).save(argThat(c ->
                c.getStatut() == CommandeStatus.LIVREE
        ));
    }

    @Test
    @DisplayName("updateStatut() passe la commande à ANNULEE")
    void updateStatut_passe_commande_annulee() {
        UpdateCommandeStatutRequest request = new UpdateCommandeStatutRequest(CommandeStatus.ANNULEE);
        when(commandeRepository.findById(1L)).thenReturn(Optional.of(commandeTest));
        when(commandeRepository.save(any(Commande.class))).thenReturn(commandeTest);

        commandeService.updateStatut(1L, request);

        verify(commandeRepository).save(argThat(c ->
                c.getStatut() == CommandeStatus.ANNULEE
        ));
    }

    @Test
    @DisplayName("updateStatut() lève NotFoundException si commande absente")
    void updateStatut_leve_exception_si_absente() {
        UpdateCommandeStatutRequest request = new UpdateCommandeStatutRequest(CommandeStatus.VALIDEE);
        when(commandeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commandeService.updateStatut(99L, request))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");

        verify(commandeRepository, never()).save(any());
    }

    // ── mapping DTO ──────────────────────────────────────────────────────

    @Test
    @DisplayName("findById() mappe correctement les champs client")
    void findById_mappe_champs_client() {
        when(commandeRepository.findByIdWithLignes(1L)).thenReturn(Optional.of(commandeTest));

        CommandeDto result = commandeService.findById(1L);

        assertThat(result.clientTelephone()).isEqualTo("+2250596282556");
        assertThat(result.clientEmail()).isEqualTo("franck@test.com");
        assertThat(result.clientAdresse()).isEqualTo("Abidjan, Cocody");
        assertThat(result.notes()).isEqualTo("Livraison rapide svp");
        assertThat(result.whatsappMessageSent()).isFalse();
    }
}
