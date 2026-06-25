package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CommandeDto;
import com.shopdropping.backoffice.dto.LigneCommandeDto;
import com.shopdropping.backoffice.dto.UpdateCommandeStatutRequest;
import com.shopdropping.backoffice.entity.*;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.CommandeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<CommandeDto> findAll(CommandeStatus statut) {
        List<Commande> commandes = statut == null
                ? commandeRepository.findAllWithLignes()
                : commandeRepository.findByStatutWithLignes(statut);
        return commandes.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public CommandeDto findById(Long id) {
        return toDto(commandeRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new NotFoundException("Commande introuvable: " + id)));
    }

    @Transactional
    public CommandeDto updateStatut(Long id, UpdateCommandeStatutRequest request) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Commande introuvable: " + id));
        CommandeStatus ancienStatut = commande.getStatut();
        commande.setStatut(request.statut());
        CommandeDto result = toDto(commandeRepository.save(commande));

        auditLogService.enregistrer(
                TypeAction.CHANGEMENT_STATUT, TypeEntite.COMMANDE,
                id, commande.getNumero(),
                String.format("Statut changé de %s → %s", ancienStatut, request.statut())
        );
        return result;
    }

    @Transactional
    public void supprimer(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Commande introuvable: " + id));
        String numero = commande.getNumero();
        commandeRepository.deleteById(id);

        auditLogService.enregistrer(
                TypeAction.SUPPRESSION, TypeEntite.COMMANDE,
                id, numero,
                "Commande supprimée: " + numero
        );
    }

    private CommandeDto toDto(Commande c) {
        List<LigneCommandeDto> lignes = c.getLignes().stream().map(this::ligneToDto).toList();
        return new CommandeDto(
                c.getId(), c.getNumero(),
                c.getClientNom(), c.getClientTelephone(), c.getClientEmail(), c.getClientAdresse(),
                c.getMontantTotal(), c.getStatut(), c.getNotes(), c.getWhatsappMessageSent(),
                lignes, c.getCreatedAt(), c.getUpdatedAt()
        );
    }

    private LigneCommandeDto ligneToDto(LigneCommande l) {
        Long produitId    = l.getProduit() != null ? l.getProduit().getId()              : null;
        String produitNom = l.getProduit() != null ? l.getProduit().getNom()             : null;
        String produitImg = l.getProduit() != null ? l.getProduit().getImagePrincipale() : null;
        return new LigneCommandeDto(
                l.getId(), produitId, produitNom, produitImg,
                l.getTaille(), l.getCouleur(), l.getQuantite(),
                l.getPrixUnitaire(), l.getPrixOptionsUnitaire(),
                l.getBadgesOfficiels(), l.getFlocage(), l.getFlocageNom(), l.getFlocageNumero(),
                l.getPrixTotal()
        );
    }
}
