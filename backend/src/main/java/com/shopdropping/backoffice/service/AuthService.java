package com.shopdropping.backoffice.service;

import com.shopdropping.backoffice.dto.AuthRequestDto;
import com.shopdropping.backoffice.dto.TokenDto;
import com.shopdropping.backoffice.entity.User;
import com.shopdropping.backoffice.repository.UserRepository;
import com.shopdropping.backoffice.security.JwtTokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtils jwtTokenUtils;

    public TokenDto authentifier(AuthRequestDto request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants invalides"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Identifiants invalides");
        }

        if (!"ACTIF".equals(user.getStatut())) {
            throw new IllegalArgumentException("Compte désactivé");
        }

        String token = jwtTokenUtils.genererToken(user);
        return new TokenDto(token);
    }
}
