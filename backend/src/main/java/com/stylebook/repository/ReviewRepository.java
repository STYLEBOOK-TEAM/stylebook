package com.stylebook.repository;

import com.stylebook.entity.Review;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByShopOrderByCreatedAtDesc(Shop shop);

    List<Review> findByCustomerOrderByCreatedAtDesc(User customer);

    Optional<Review> findByBookingId(UUID bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.shop = :shop")
    Double getAverageRatingByShop(@Param("shop") Shop shop);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.shop = :shop AND r.rating = :rating")
    Long countByShopAndRating(@Param("shop") Shop shop, @Param("rating") Integer rating);

    boolean existsByBookingId(UUID bookingId);
}