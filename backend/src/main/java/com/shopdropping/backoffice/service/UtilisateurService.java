package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CreateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UpdateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UtilisateurDto;
import com.shopdropping.backoffice.entity.User;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public List<UtilisateurDto> findAll() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UtilisateurDto findById(Long id) {
        return toDto(userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable: " + id)));
    }

    @Transactional
    public UtilisateurDto create(CreateUtilisateurRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Ce nom d'utilisateur est déjà pris");
        }
        if ("SUPER_ADMIN".equals(request.role())) {
            throw new IllegalArgumentException("Impossible de créer un SUPER_ADMIN via l'API");
        }
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .nom(request.nom())
                .prenoms(request.prenoms())
                .role(request.role())
                .telephone(request.telephone())
                .statut("ACTIF")
                .recevoirCommandes(false)
                .build();
        return toDto(userRepository.save(user));
    }

    @Transactional
    public UtilisateurDto update(Long id, UpdateUtilisateurRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable: " + id));

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.nom() != null) user.setNom(request.nom());
        if (request.prenoms() != null) user.setPrenoms(request.prenoms());
        if (request.telephone() != null) user.setTelephone(request.telephone());
        if (request.role() != null) {
            if ("SUPER_ADMIN".equals(request.role())) {
                throw new IllegalArgumentException("Impossible d'assigner le rôle SUPER_ADMIN via l'API");
            }
            user.setRole(request.role());
        }
        if (request.statut() != null) user.setStatut(request.statut());

        return toDto(userRepository.save(user));
    }

    @Transactional
    public UtilisateurDto changerStatut(Long id, String statut) {
        if (statut == null || (!statut.equals("ACTIF") && !statut.equals("INACTIF"))) {
            throw new IllegalArgumentException("Statut invalide. Valeurs acceptées: ACTIF, INACTIF");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable: " + id));
        user.setStatut(statut);
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void supprimer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable: " + id));
        if ("SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Impossible de supprimer le SUPER_ADMIN");
        }
        userRepository.deleteById(id);
    }

    // Définit l'admin qui recevra les commandes (un seul à la fois)
    @Transactional
    public UtilisateurDto definirAdminActif(Long id) {
        User cible = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable: " + id));
        if (cible.getTelephone() == null || cible.getTelephone().isBlank()) {
            throw new IllegalArgumentException("Cet admin n'a pas de numéro de téléphone configuré.");
        }
        // Désactiver tous les autres
        userRepository.findAll().forEach(u -> {
            if (!u.getId().equals(id) && Boolean.TRUE.equals(u.getRecevoirCommandes())) {
                u.setRecevoirCommandes(false);
                userRepository.save(u);
            }
        });
        cible.setRecevoirCommandes(true);
        UtilisateurDto result = toDto(userRepository.save(cible));

        // Synchroniser le numéro WhatsApp dans la table configuration du FrontOffice (DB partagée)
        String telephone = cible.getTelephone();
        int updated = jdbcTemplate.update(
                "UPDATE configuration SET valeur = ? WHERE cle = 'whatsapp_numero'", telephone);
        if (updated == 0) {
            jdbcTemplate.update(
                    "INSERT INTO configuration (cle, valeur, description) VALUES ('whatsapp_numero', ?, 'Numéro WhatsApp Business de la boutique')",
                    telephone);
        }

        return result;
    }

    // Retourne le numéro de l'admin actif (pour le FrontOffice)
    public Map<String, String> getNumeroAdminActif() {
        Optional<User> actif = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getRecevoirCommandes()))
                .findFirst();
        String numero = actif.map(User::getTelephone).orElse(null);
        String nom    = actif.map(u -> u.getNom() + " " + u.getPrenoms()).orElse("Non configuré");
        return Map.of(
                "telephone",  numero != null ? numero : "",
                "nom",        nom,
                "configure",  String.valueOf(numero != null && !numero.isBlank())
        );
    }

    // Réinitialise le mot de passe — retourne le mot de passe temporaire
    @Transactional
    public String resetMotDePasse(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Aucun compte avec ce nom d'utilisateur."));
        String tempPassword = genererMotDePasseTemp(10);
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        return tempPassword;
    }

    private String genererMotDePasseTemp(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }

    private UtilisateurDto toDto(User u) {
        return new UtilisateurDto(
                u.getId(), u.getUsername(), u.getNom(), u.getPrenoms(),
                u.getRole(), u.getStatut(), u.getTelephone(),
                u.getRecevoirCommandes(), u.getCreatedAt()
        );
    }
}
