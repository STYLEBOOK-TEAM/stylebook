package com.stylebook.dto;

import com.stylebook.entity.Booking;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingDTO {

    @Data
    public static class SlotsResponse {
        private boolean open;
        private List<String> slots;
    }

    @Data
    public static class CreateBookingRequest {
        private String shopId;
        private String serviceId;
        private LocalDate bookingDate;
        private LocalTime bookingTime;
    }

    @Data
    public static class RescheduleBookingRequest {
        private LocalDate bookingDate;
        private LocalTime bookingTime;
    }

    @Data
    public static class BookingResponse {
        private String id;
        private String customerId;
        private String customerName;
        private String customerPhone;
        private String shopId;
        private String shopName;
        private String shopCoverImage;
        private String serviceId;
        private String serviceName;
        private String servicePrice;
        private Integer serviceDuration;
        private LocalDate bookingDate;
        private LocalTime bookingTime;
        private String status;
        private boolean rescheduled;
        private String autoConfirmAt;
        private String createdAt;

        public static BookingResponse from(Booking booking) {
            BookingResponse response = new BookingResponse();
            response.setId(booking.getId().toString());
            response.setCustomerId(booking.getCustomer().getId().toString());
            response.setCustomerName(booking.getCustomer().getFullName());
            response.setCustomerPhone(booking.getCustomer().getPhone());
            response.setShopId(booking.getShop().getId().toString());
            response.setShopName(booking.getShop().getName());
            response.setShopCoverImage(booking.getShop().getCoverImageUrl());
            response.setServiceId(booking.getService().getId().toString());
            response.setServiceName(booking.getService().getName());
            response.setServicePrice(booking.getService().getPrice().toString());
            response.setServiceDuration(booking.getService().getDurationMinutes());
            response.setBookingDate(booking.getBookingDate());
            response.setBookingTime(booking.getBookingTime());
            response.setStatus(booking.getStatus().name());
            response.setRescheduled(Boolean.TRUE.equals(booking.getRescheduled()));
            if (booking.getAutoConfirmAt() != null) {
                response.setAutoConfirmAt(booking.getAutoConfirmAt().toString());
            }
            response.setCreatedAt(booking.getCreatedAt() != null ?
                    booking.getCreatedAt().toString() : "");
            return response;
        }
    }
}