package com.stylebook.repository;

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
public interface ShopRepository extends JpaRepository<Shop, UUID> {

    List<Shop> findByIsActiveTrue();

    List<Shop> findByOwner(User owner);

    Optional<Shop> findByOwnerAndIsActiveTrue(User owner);

    @Query("SELECT s FROM Shop s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Shop> searchShops(@Param("query") String query);

    @Query("SELECT s FROM Shop s WHERE s.isActive = true AND " +
           "s.category = :category")
    List<Shop> findByCategory(@Param("category") Shop.ShopCategory category);

    @Query("SELECT s FROM Shop s WHERE s.isActive = true AND " +
           "(:query IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR s.category = :category)")
    List<Shop> findByFilters(@Param("query") String query,
                             @Param("category") Shop.ShopCategory category);
}