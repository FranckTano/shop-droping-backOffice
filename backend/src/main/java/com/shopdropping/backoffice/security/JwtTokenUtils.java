package com.shopdropping.backoffice.security;

import com.shopdropping.backoffice.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenUtils {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long expiration;

    public String genererToken(User user) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("id", user.getId())
                .claim("username", user.getUsername())
                .claim("nom", user.getNom())
                .claim("prenoms", user.getPrenoms())
                .claim("role", user.getRole())
                .claim("statut", user.getStatut())
                .claim("fonctionnalites", List.of())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extraireClaims(String token) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extraireUsername(String token) {
        return extraireClaims(token).getSubject();
    }

    public String extraireRole(String token) {
        return extraireClaims(token).get("role", String.class);
    }

    public boolean estExpire(String token) {
        return extraireClaims(token).getExpiration().before(new Date());
    }

    public boolean estValide(String token) {
        try {
            return !estExpire(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
