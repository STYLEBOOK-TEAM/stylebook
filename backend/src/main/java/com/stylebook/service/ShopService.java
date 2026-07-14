package com.stylebook.service;
import com.stylebook.dto.ServiceDTO;
import com.stylebook.dto.ShopDTO;
import com.stylebook.entity.Shop;
import com.stylebook.entity.ShopPhoto;
import com.stylebook.entity.User;
import com.stylebook.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ShopService {
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final ShopPhotoRepository shopPhotoRepository;
    private final FavouriteRepository favouriteRepository;
    public List<ShopDTO.ShopResponse> getAllShops(String query, String category, UUID currentUserId) {
        List<Shop> shops;
        Shop.ShopCategory shopCategory = null;
        if (category != null && !category.isEmpty()) {
            try {
                shopCategory = Shop.ShopCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        boolean hasQuery = query != null && !query.trim().isEmpty();
        if (!hasQuery && shopCategory == null) {
            shops = shopRepository.findByIsActiveTrue();
        } else if (!hasQuery) {
            shops = shopRepository.findByCategory(shopCategory);
        } else {
            shops = shopRepository.searchShops(query.trim());
            if (shopCategory != null) {
                final Shop.ShopCategory categoryFilter = shopCategory;
                shops = shops.stream()
                        .filter(s -> s.getCategory() == categoryFilter)
                        .collect(Collectors.toList());
            }
        }
        return shops.stream()
                .map(shop -> mapToResponse(shop, currentUserId))
                .collect(Collectors.toList());
    }
    public List<ShopDTO.ShopResponse> getNearbyShops(double lat, double lng, UUID currentUserId) {
        return shopRepository.findByIsActiveTrue().stream()
                .map(shop -> {
                    ShopDTO.ShopResponse response = mapToResponse(shop, currentUserId);
                    if (shop.getLatitude() != null && shop.getLongitude() != null) {
                        double distance = haversineKm(lat, lng, shop.getLatitude(), shop.getLongitude());
                        response.setDistanceKm(Math.round(distance * 10.0) / 10.0);
                    }
                    return response;
                })
                .sorted(Comparator.comparing(
                        ShopDTO.ShopResponse::getDistanceKm,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    public ShopDTO.ShopResponse getShopById(UUID shopId, UUID currentUserId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return mapToResponse(shop, currentUserId);
    }
    public ShopDTO.ShopResponse getMyShop(UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        return mapToResponse(shop, ownerId);
    }
    @Transactional
    public ShopDTO.ShopResponse updateShop(UUID ownerId, ShopDTO.UpdateShopRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        if (request.getName() != null) shop.setName(request.getName());
        if (request.getDescription() != null) shop.setDescription(request.getDescription());
        if (request.getCity() != null) shop.setCity(request.getCity());
        if (request.getGoogleMapsLink() != null) shop.setGoogleMapsLink(request.getGoogleMapsLink());
        if (request.getLocationDescription() != null) shop.setLocationDescription(request.getLocationDescription());
        if (request.getOpeningHours() != null) shop.setOpeningHours(request.getOpeningHours());
        if (request.getLatitude() != null) shop.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) shop.setLongitude(request.getLongitude());
        if (request.getCategory() != null) {
            try {
                shop.setCategory(Shop.ShopCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        shopRepository.save(shop);
        return mapToResponse(shop, ownerId);
    }
    @Transactional
    public ShopDTO.ShopResponse updateCoverPhoto(UUID ownerId, String imageUrl) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        shop.setCoverImageUrl(imageUrl);
        shopRepository.save(shop);
        return mapToResponse(shop, ownerId);
    }
    @Transactional
    public ServiceDTO.ServiceResponse addService(UUID ownerId,
                                                  ServiceDTO.CreateServiceRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        com.stylebook.entity.Service service = com.stylebook.entity.Service.builder()
                .shop(shop)
                .name(request.getName())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .isActive(true)
                .build();
        serviceRepository.save(service);
        return ServiceDTO.ServiceResponse.from(service);
    }
    @Transactional
    public ServiceDTO.ServiceResponse updateService(UUID ownerId, UUID serviceId,
                                                     ServiceDTO.CreateServiceRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        com.stylebook.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        if (request.getName() != null && !request.getName().isEmpty()) {
            service.setName(request.getName());
        }
        if (request.getPrice() != null) {
            service.setPrice(request.getPrice());
        }
        if (request.getDurationMinutes() != null) {
            service.setDurationMinutes(request.getDurationMinutes());
        }
        serviceRepository.save(service);
        return ServiceDTO.ServiceResponse.from(service);
    }
    @Transactional
    public void removeService(UUID ownerId, UUID serviceId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        com.stylebook.entity.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        serviceRepository.delete(service);
    }
    @Transactional
    public void addGalleryPhoto(UUID ownerId, String imageUrl) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        long photoCount = shopPhotoRepository.countByShop(shop);
        if (shop.getPlan() == Shop.SubscriptionPlan.FREE && photoCount >= 3) {
            throw new RuntimeException("Free plan allows maximum 3 gallery photos");
        }
        ShopPhoto photo = ShopPhoto.builder()
                .shop(shop)
                .imageUrl(imageUrl)
                .build();
        shopPhotoRepository.save(photo);
    }
    @Transactional
    public void deleteGalleryPhoto(UUID ownerId, UUID photoId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        shopPhotoRepository.deleteByShopAndId(shop, photoId);
    }
    @Transactional
    public void toggleFavourite(UUID customerId, UUID shopId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        if (favouriteRepository.existsByCustomerAndShop(customer, shop)) {
            favouriteRepository.deleteByCustomerAndShop(customer, shop);
        } else {
            com.stylebook.entity.Favourite favourite = com.stylebook.entity.Favourite.builder()
                    .customer(customer)
                    .shop(shop)
                    .build();
            favouriteRepository.save(favourite);
        }
    }
    public List<ShopDTO.ShopResponse> getFavourites(UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return favouriteRepository.findByCustomer(customer).stream()
                .map(fav -> mapToResponse(fav.getShop(), customerId))
                .collect(Collectors.toList());
    }
    private ShopDTO.ShopResponse mapToResponse(Shop shop, UUID currentUserId) {
        ShopDTO.ShopResponse response = ShopDTO.ShopResponse.from(shop);
        List<ServiceDTO.ServiceResponse> services = serviceRepository
                .findByShopAndIsActiveTrue(shop)
                .stream()
                .map(ServiceDTO.ServiceResponse::from)
                .collect(Collectors.toList());
        response.setServices(services);
        List<String> photoUrls = shopPhotoRepository.findByShopOrderByCreatedAtDesc(shop)
                .stream()
                .map(ShopPhoto::getImageUrl)
                .collect(Collectors.toList());
        response.setPhotoUrls(photoUrls);
        response.setPhotos(shopPhotoRepository.findByShopOrderByCreatedAtDesc(shop)
                .stream()
                .map(photo -> {
                    ShopDTO.PhotoResponse pr = new ShopDTO.PhotoResponse();
                    pr.setId(photo.getId().toString());
                    pr.setImageUrl(photo.getImageUrl());
                    return pr;
                })
                .collect(Collectors.toList()));
        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                response.setFavourited(
                    favouriteRepository.existsByCustomerAndShop(currentUser, shop)
                );
            }
        }
        return response;
    }
}
