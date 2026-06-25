package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.AuditLogDto;
import com.shopdropping.backoffice.entity.TypeEntite;
import com.shopdropping.backoffice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public Page<AuditLogDto> lister(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) TypeEntite typeEntite,
            @RequestParam(required = false, defaultValue = "30") Integer joursHistorique,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int taille
    ) {
        return auditLogService.lister(username, typeEntite, joursHistorique, page, taille);
    }
}
