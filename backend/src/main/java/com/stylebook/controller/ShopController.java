package com.stylebook.controller;
import com.stylebook.dto.ServiceDTO;
import com.stylebook.dto.ShopDTO;
import com.stylebook.service.FileUploadService;
import com.stylebook.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {
    private final ShopService shopService;
    private final FileUploadService fileUploadService;
    @GetMapping
    public ResponseEntity<List<ShopDTO.ShopResponse>> getAllShops(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(shopService.getAllShops(query, category, currentUserId));
    }
    @GetMapping("/nearby")
    public ResponseEntity<List<ShopDTO.ShopResponse>> getNearbyShops(
            @RequestParam double lat,
            @RequestParam double lng,
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(shopService.getNearbyShops(lat, lng, currentUserId));
    }
    @GetMapping("/{shopId}")
    public ResponseEntity<ShopDTO.ShopResponse> getShopById(
            @PathVariable UUID shopId,
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(shopService.getShopById(shopId, currentUserId));
    }
    @GetMapping("/my-shop")
    public ResponseEntity<ShopDTO.ShopResponse> getMyShop(Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(shopService.getMyShop(ownerId));
    }
    @PutMapping("/my-shop")
    public ResponseEntity<ShopDTO.ShopResponse> updateShop(
            @RequestBody ShopDTO.UpdateShopRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(shopService.updateShop(ownerId, request));
    }
    @PostMapping("/my-shop/cover-photo")
    public ResponseEntity<ShopDTO.ShopResponse> uploadCoverPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        UUID ownerId = (UUID) authentication.getPrincipal();
        String imageUrl = fileUploadService.uploadFile(file);
        return ResponseEntity.ok(shopService.updateCoverPhoto(ownerId, imageUrl));
    }
    @PostMapping("/my-shop/gallery")
    public ResponseEntity<Void> addGalleryPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        UUID ownerId = (UUID) authentication.getPrincipal();
        String imageUrl = fileUploadService.uploadFile(file);
        shopService.addGalleryPhoto(ownerId, imageUrl);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/my-shop/gallery/{photoId}")
    public ResponseEntity<Void> deleteGalleryPhoto(
            @PathVariable UUID photoId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        shopService.deleteGalleryPhoto(ownerId, photoId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/my-shop/services")
    public ResponseEntity<ServiceDTO.ServiceResponse> addService(
            @RequestBody ServiceDTO.CreateServiceRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(shopService.addService(ownerId, request));
    }
    @PutMapping("/my-shop/services/{serviceId}")
    public ResponseEntity<ServiceDTO.ServiceResponse> updateService(
            @PathVariable UUID serviceId,
            @RequestBody ServiceDTO.CreateServiceRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(shopService.updateService(ownerId, serviceId, request));
    }
    @DeleteMapping("/my-shop/services/{serviceId}")
    public ResponseEntity<Void> removeService(
            @PathVariable UUID serviceId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        shopService.removeService(ownerId, serviceId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/{shopId}/favourite")
    public ResponseEntity<Void> toggleFavourite(
            @PathVariable UUID shopId,
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        shopService.toggleFavourite(customerId, shopId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/favourites")
    public ResponseEntity<List<ShopDTO.ShopResponse>> getFavourites(
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(shopService.getFavourites(customerId));
    }
}