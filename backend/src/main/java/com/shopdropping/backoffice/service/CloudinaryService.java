package com.shopdropping.backoffice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private static final Set<String> TYPES_AUTORISES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long TAILLE_MAX = 10L * 1024 * 1024; // 10 MB

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:shop-dropping/backoffice/produits}")
    private String folder;

    public String upload(MultipartFile file) {
        valider(file);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder",        folder,
                            "resource_type", "image",
                            "overwrite",     false
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new IllegalStateException("Échec de l'upload Cloudinary : " + e.getMessage(), e);
        }
    }

    public void supprimer(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return;
        }
        try {
            String publicId = extrairePublicId(imageUrl);
            if (!publicId.isBlank()) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception ignored) {
        }
    }

    private void valider(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !TYPES_AUTORISES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Format non supporté : " + contentType + ". Utilisez JPEG, PNG ou WEBP.");
        }
        if (file.getSize() > TAILLE_MAX) {
            throw new IllegalArgumentException("Fichier trop volumineux (max 10 Mo).");
        }
    }

    // Extrait le public_id depuis une URL Cloudinary
    // Exemple : https://res.cloudinary.com/cloud/image/upload/v123/shop-dropping/produit.jpg
    //           → shop-dropping/produit
    private String extrairePublicId(String url) {
        String withoutQuery = url.split("\\?")[0];
        String[] parts = withoutQuery.split("/upload/");
        if (parts.length < 2) return "";
        String afterUpload = parts[1].replaceFirst("^v\\d+/", "");
        int dotIdx = afterUpload.lastIndexOf('.');
        return dotIdx > 0 ? afterUpload.substring(0, dotIdx) : afterUpload;
    }
}
