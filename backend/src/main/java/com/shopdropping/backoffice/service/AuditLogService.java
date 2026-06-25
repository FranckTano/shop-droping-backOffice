package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.AuditLogDto;
import com.shopdropping.backoffice.entity.AuditLog;
import com.shopdropping.backoffice.entity.TypeAction;
import com.shopdropping.backoffice.entity.TypeEntite;
import com.shopdropping.backoffice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void enregistrer(TypeAction action, TypeEntite entite,
                            Long entiteId, String entiteRef, String description) {
        String username = "système";
        String nom = "Système";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
            nom = username;
            if (auth.getDetails() instanceof java.util.Map<?,?> details) {
                Object prenoms = details.get("prenoms");
                Object nomVal  = details.get("nom");
                if (prenoms != null || nomVal != null) {
                    nom = ((prenoms != null ? prenoms.toString() : "") + " " +
                           (nomVal  != null ? nomVal.toString()  : "")).trim();
                }
            }
        }

        AuditLog log = AuditLog.builder()
                .adminUsername(username)
                .adminNom(nom)
                .typeAction(action)
                .typeEntite(entite)
                .entiteId(entiteId)
                .entiteReference(entiteRef)
                .description(description)
                .build();

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> lister(String username, TypeEntite typeEntite,
                                    Integer joursHistorique, int page, int taille) {
        LocalDateTime depuis = joursHistorique != null
                ? LocalDateTime.now().minusDays(joursHistorique)
                : null;

        String usernameFiltre = (username != null && username.isBlank()) ? null : username;

        return auditLogRepository
                .filtrer(usernameFiltre, typeEntite, depuis,
                        PageRequest.of(page, taille, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toDto);
    }

    private AuditLogDto toDto(AuditLog a) {
        return new AuditLogDto(
                a.getId(), a.getAdminUsername(), a.getAdminNom(),
                a.getTypeAction(), a.getTypeEntite(),
                a.getEntiteId(), a.getEntiteReference(),
                a.getDescription(), a.getCreatedAt()
        );
    }
}
