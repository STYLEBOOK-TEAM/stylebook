package com.stylebook.dto;

import com.stylebook.entity.Service;
import lombok.Data;

import java.math.BigDecimal;

public class ServiceDTO {

    @Data
    public static class ServiceResponse {
        private String id;
        private String shopId;
        private String name;
        private BigDecimal price;
        private Integer durationMinutes;

        public static ServiceResponse from(Service service) {
            ServiceResponse response = new ServiceResponse();
            response.setId(service.getId().toString());
            response.setShopId(service.getShop().getId().toString());
            response.setName(service.getName());
            response.setPrice(service.getPrice());
            response.setDurationMinutes(service.getDurationMinutes());
            return response;
        }
    }

    @Data
    public static class CreateServiceRequest {
        private String name;
        private BigDecimal price;
        private Integer durationMinutes;
    }
}