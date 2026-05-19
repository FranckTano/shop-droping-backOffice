package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CommandeDto;
import com.shopdropping.backoffice.dto.LigneCommandeDto;
import com.shopdropping.backoffice.dto.UpdateCommandeStatutRequest;
import com.shopdropping.backoffice.entity.Commande;
import com.shopdropping.backoffice.entity.CommandeStatus;
import com.shopdropping.backoffice.entity.LigneCommande;
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
        commande.setStatut(request.statut());
        return toDto(commandeRepository.save(commande));
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
        Long produitId = l.getProduit() != null ? l.getProduit().getId() : null;
        String produitNom = l.getProduit() != null ? l.getProduit().getNom() : null;
        String produitImage = l.getProduit() != null ? l.getProduit().getImagePrincipale() : null;
        return new LigneCommandeDto(
                l.getId(), produitId, produitNom, produitImage,
                l.getTaille(), l.getCouleur(), l.getQuantite(),
                l.getPrixUnitaire(), l.getPrixOptionsUnitaire(),
                l.getBadgesOfficiels(), l.getFlocage(), l.getFlocageNom(), l.getFlocageNumero(),
                l.getPrixTotal()
        );
    }
}
