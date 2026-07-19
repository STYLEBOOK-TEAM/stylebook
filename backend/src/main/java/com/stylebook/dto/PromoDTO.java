package com.stylebook.dto;

import com.stylebook.entity.Promo;
import lombok.Data;

public class PromoDTO {

    @Data
    public static class CreatePromoRequest {
        private String imageUrl;
        private String details;
    }

    @Data
    public static class PromoResponse {
        private String id;
        private String shopId;
        private String shopName;
        private String shopCategory;
        private String city;
        private String imageUrl;
        private String details;
        private String createdAt;

        public static PromoResponse from(Promo promo) {
            PromoResponse response = new PromoResponse();
            response.setId(promo.getId().toString());
            response.setShopId(promo.getShop().getId().toString());
            response.setShopName(promo.getShop().getName());
            response.setShopCategory(promo.getShop().getCategory().name());
            response.setCity(promo.getShop().getCity());
            response.setImageUrl(promo.getImageUrl());
            response.setDetails(promo.getDetails());
            response.setCreatedAt(promo.getCreatedAt() != null ? promo.getCreatedAt().toString() : "");
            return response;
        }
    }
}
