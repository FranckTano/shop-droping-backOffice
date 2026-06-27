package com.shopdropping.backoffice.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex, HttpServletRequest req) {
        log.warn("[404] {} {}", req.getMethod(), req.getRequestURI());
        return error(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        log.warn("[400] {} {} — {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        log.warn("[422] Validation failed {} {} : {}", req.getMethod(), req.getRequestURI(), fieldErrors);
        return error(HttpStatus.UNPROCESSABLE_ENTITY, "Données invalides", fieldErrors);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        return error(HttpStatus.BAD_REQUEST, "Paramètre manquant : " + ex.getParameterName(), null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return error(HttpStatus.BAD_REQUEST, "Valeur invalide pour le paramètre : " + ex.getName(), null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxSize(MaxUploadSizeExceededException ex) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE, "Fichier trop volumineux (max 10 Mo)", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("[409] Contrainte BD {} {} : {}", req.getMethod(), req.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return error(HttpStatus.CONFLICT, "Opération refusée : contrainte de données violée", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        log.warn("[403] Accès refusé {} {}", req.getMethod(), req.getRequestURI());
        return error(HttpStatus.FORBIDDEN, "Accès refusé", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest req) {
        String requestId = MDC.get("requestId");
        log.error("[500] Erreur inattendue {} {} requestId={}", req.getMethod(), req.getRequestURI(), requestId, ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erreur interne du serveur" + (requestId != null ? " (ref: " + requestId + ")" : ""), null);
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message, Map<String, String> fieldErrors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        if (fieldErrors != null && !fieldErrors.isEmpty()) {
            body.put("errors", fieldErrors);
        }
        String requestId = MDC.get("requestId");
        if (requestId != null) body.put("requestId", requestId);
        return ResponseEntity.status(status).body(body);
    }
}
