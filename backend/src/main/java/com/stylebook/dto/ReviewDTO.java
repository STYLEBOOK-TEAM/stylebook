package com.stylebook.dto;

import com.stylebook.entity.Review;
import lombok.Data;

public class ReviewDTO {

    @Data
    public static class CreateReviewRequest {
        private String bookingId;
        private String shopId;
        private Integer rating;
        private String comment;
    }

    @Data
    public static class OwnerReplyRequest {
        private String reply;
    }

    @Data
    public static class ReviewResponse {
        private String id;
        private String customerId;
        private String customerName;
        private String shopId;
        private String shopName;
        private String bookingId;
        private Integer rating;
        private String comment;
        private String ownerReply;
        private String ownerRepliedAt;
        private String createdAt;

        public static ReviewResponse from(Review review) {
            ReviewResponse response = new ReviewResponse();
            response.setId(review.getId().toString());
            response.setCustomerId(review.getCustomer().getId().toString());
            response.setCustomerName(review.getCustomer().getFullName());
            response.setShopId(review.getShop().getId().toString());
            response.setShopName(review.getShop().getName());
            response.setBookingId(review.getBooking().getId().toString());
            response.setRating(review.getRating());
            response.setComment(review.getComment());
            response.setOwnerReply(review.getOwnerReply());
            if (review.getOwnerRepliedAt() != null) {
                response.setOwnerRepliedAt(review.getOwnerRepliedAt().toString());
            }
            response.setCreatedAt(review.getCreatedAt().toString());
            return response;
        }
    }

    @Data
    public static class RatingBreakdown {
        private Double averageRating;
        private Integer totalReviews;
        private Long fiveStar;
        private Long fourStar;
        private Long threeStar;
        private Long twoStar;
        private Long oneStar;
    }
}