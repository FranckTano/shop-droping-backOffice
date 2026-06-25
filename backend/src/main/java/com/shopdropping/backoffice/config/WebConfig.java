package com.shopdropping.backoffice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file-upload-base-path:#{systemProperties['user.home']}/shop-dropping/uploads}")
    private String uploadBasePath;

    private static final List<String> ALLOWED_ORIGINS = List.of(
            "https://shop-droping-back-office.vercel.app",
            "https://shop-droping-admin.vercel.app",
            "http://localhost:4480",
            "http://localhost:4400"
    );

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(ALLOWED_ORIGINS.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "Accept", "X-Requested-With")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Sert les images uploadées localement via GET /uploads/**
        Path uploadDir = Paths.get(uploadBasePath);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir.toAbsolutePath() + "/");
    }
}
