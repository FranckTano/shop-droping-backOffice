package com.shopdropping.backoffice.controller;

import com.shopdropping.backoffice.dto.ImageUploadResponseDto;
import com.shopdropping.backoffice.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponseDto> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String imageUrl = fileStorageService.stocker(file);
        if (imageUrl == null) {
            return ResponseEntity.badRequest().build();
        }
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        return ResponseEntity.ok(new ImageUploadResponseDto(imageUrl, filename));
    }
}
