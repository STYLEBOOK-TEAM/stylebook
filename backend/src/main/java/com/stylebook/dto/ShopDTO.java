package com.stylebook.dto;
import com.stylebook.entity.Shop;
import lombok.Data;
import java.util.List;
public class ShopDTO {
    @Data
    public static class PhotoResponse {
        private String id;
        private String imageUrl;
    }
    @Data
    public static class ShopResponse {
        private String id;
        private String ownerId;
        private String ownerName;
        private String name;
        private String category;
        private String description;
        private String city;
        private Double latitude;
        private Double longitude;
        private Double distanceKm;
        private String googleMapsLink;
        private String locationDescription;
        private String coverImageUrl;
        private String plan;
        private boolean isActive;
        private String openingHours;
        private Double avgRating;
        private Integer reviewCount;
        private List<ServiceDTO.ServiceResponse> services;
        private List<String> photoUrls;
        private List<PhotoResponse> photos;
        private boolean isFavourited;
        private boolean isOpen;
        private String todayHours;
        public static ShopResponse from(Shop shop) {
            ShopResponse response = new ShopResponse();
            response.setId(shop.getId().toString());
            response.setOwnerId(shop.getOwner().getId().toString());
            response.setOwnerName(shop.getOwner().getFullName());
            response.setName(shop.getName());
            response.setCategory(shop.getCategory().name());
            response.setDescription(shop.getDescription());
            response.setCity(shop.getCity());
            response.setLatitude(shop.getLatitude());
            response.setLongitude(shop.getLongitude());
            response.setGoogleMapsLink(shop.getGoogleMapsLink());
            response.setLocationDescription(shop.getLocationDescription());
            response.setCoverImageUrl(shop.getCoverImageUrl());
            response.setPlan(shop.getPlan().name());
            response.setActive(shop.isActive());
            response.setOpeningHours(shop.getOpeningHours());
            response.setAvgRating(shop.getAvgRating());
            response.setReviewCount(shop.getReviewCount());
            return response;
        }
    }
    @Data
    public static class UpdateShopRequest {
        private String name;
        private String description;
        private String city;
        private String googleMapsLink;
        private String locationDescription;
        private String category;
        private String openingHours;
        private Double latitude;
        private Double longitude;
    }
}