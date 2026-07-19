package com.stylebook.controller;

import com.stylebook.dto.PromoDTO;
import com.stylebook.service.FileUploadService;
import com.stylebook.service.PromoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/promos")
@RequiredArgsConstructor
public class PromoController {

    private final PromoService promoService;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<List<PromoDTO.PromoResponse>> getAll() {
        return ResponseEntity.ok(promoService.getAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<PromoDTO.PromoResponse>> getMine(Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(promoService.getMine(ownerId));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        String imageUrl = fileUploadService.uploadFile(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @PostMapping
    public ResponseEntity<PromoDTO.PromoResponse> create(
            @RequestBody PromoDTO.CreatePromoRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(promoService.create(ownerId, request));
    }

    @DeleteMapping("/{promoId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID promoId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        promoService.delete(ownerId, promoId);
        return ResponseEntity.ok().build();
    }
}
