package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.AuthRequestDto;
import com.shopdropping.backoffice.dto.TokenDto;
import com.shopdropping.backoffice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ws/securite/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDto request) {
        try {
            TokenDto token = authService.authentifier(request);
            return ResponseEntity.ok(token);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

}
