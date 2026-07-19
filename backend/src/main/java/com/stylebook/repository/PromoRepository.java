package com.stylebook.repository;

import com.stylebook.entity.Promo;
import com.stylebook.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromoRepository extends JpaRepository<Promo, UUID> {
    List<Promo> findByShopOrderByCreatedAtDesc(Shop shop);
    List<Promo> findAllByOrderByCreatedAtDesc();
}
