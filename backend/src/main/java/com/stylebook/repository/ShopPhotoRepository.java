package com.stylebook.repository;

import com.stylebook.entity.Shop;
import com.stylebook.entity.ShopPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopPhotoRepository extends JpaRepository<ShopPhoto, UUID> {

    List<ShopPhoto> findByShopOrderByCreatedAtDesc(Shop shop);

    Long countByShop(Shop shop);

    void deleteByShopAndId(Shop shop, UUID id);
}