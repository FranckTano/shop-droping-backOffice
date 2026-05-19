package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.CreateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UpdateUtilisateurRequest;
import com.shopdropping.backoffice.dto.UtilisateurDto;
import com.shopdropping.backoffice.entity.User;
import com.shopdropping.backoffice.exception.NotFoundException;
import com.shopdropping.backoffice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                .statut("ACTIF")
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

    private UtilisateurDto toDto(User u) {
        return new UtilisateurDto(u.getId(), u.getUsername(), u.getNom(), u.getPrenoms(),
                u.getRole(), u.getStatut(), u.getCreatedAt());
    }
}
