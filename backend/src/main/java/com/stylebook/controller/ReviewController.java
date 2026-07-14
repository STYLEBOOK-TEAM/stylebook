package com.stylebook.controller;

import com.stylebook.dto.ReviewDTO;
import com.stylebook.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO.ReviewResponse> createReview(
            @RequestBody ReviewDTO.CreateReviewRequest request,
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(reviewService.createReview(customerId, request));
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewDTO.ReviewResponse> addOwnerReply(
            @PathVariable UUID reviewId,
            @RequestBody ReviewDTO.OwnerReplyRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(reviewService.addOwnerReply(ownerId, reviewId, request));
    }

    @DeleteMapping("/{reviewId}/reply")
    public ResponseEntity<Void> deleteOwnerReply(
            @PathVariable UUID reviewId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        reviewService.deleteOwnerReply(ownerId, reviewId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReviewDTO.ReviewResponse>> getShopReviews(
            @PathVariable UUID shopId) {
        return ResponseEntity.ok(reviewService.getShopReviews(shopId));
    }

    @GetMapping("/shop/{shopId}/breakdown")
    public ResponseEntity<ReviewDTO.RatingBreakdown> getShopRatingBreakdown(
            @PathVariable UUID shopId) {
        return ResponseEntity.ok(reviewService.getShopRatingBreakdown(shopId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewDTO.ReviewResponse>> getMyReviews(
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(reviewService.getMyReviews(customerId));
    }
}