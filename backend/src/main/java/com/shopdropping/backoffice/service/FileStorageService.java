package com.shopdropping.backoffice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FileStorageService {

    @Value("${file.product.image-path:${user.home}/shop-dropping/products/images}")
    private String imageBasePath;

    public String stocker(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalName = file.getOriginalFilename();
        String safeName = (originalName == null ? "image" : originalName).replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + "_" + safeName;

        Path dir = Paths.get(imageBasePath);
        Path target = dir.resolve(fileName);

        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de stocker l'image: " + e.getMessage(), e);
        }

        return "/uploads/produits/" + fileName;
    }

    public void supprimer(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/produits/")) {
            return;
        }
        String fileName = imageUrl.substring("/uploads/produits/".length());
        Path target = Paths.get(imageBasePath, fileName);
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
        }
    }
}
