package com.stylebook.dto;
import com.stylebook.entity.QueueEntry;
import lombok.Data;
import java.time.format.DateTimeFormatter;
public class QueueDTO {
    @Data
    public static class JoinRequest {
        private String shopId;
        private String serviceId;
    }
    @Data
    public static class EntryResponse {
        private String id;
        private String shopId;
        private String shopName;
        private String customerId;
        private String customerName;
        private String serviceId;
        private String serviceName;
        private Integer durationMinutes;
        private String status;
        private Integer position;
        private Integer estimatedWaitMinutes;
        private String joinedAt;
        public static EntryResponse from(QueueEntry entry) {
            EntryResponse response = new EntryResponse();
            response.setId(entry.getId().toString());
            response.setShopId(entry.getShop().getId().toString());
            response.setShopName(entry.getShop().getName());
            response.setCustomerId(entry.getCustomer().getId().toString());
            response.setCustomerName(entry.getCustomer().getFullName());
            if (entry.getService() != null) {
                response.setServiceId(entry.getService().getId().toString());
                response.setServiceName(entry.getService().getName());
                response.setDurationMinutes(entry.getService().getDurationMinutes());
            }
            response.setStatus(entry.getStatus().name());
            response.setJoinedAt(entry.getJoinedAt() != null
                    ? entry.getJoinedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
            return response;
        }
    }
    @Data
    public static class QueueSummary {
        private int waitingCount;
        private int estimatedWaitMinutes;
    }
}