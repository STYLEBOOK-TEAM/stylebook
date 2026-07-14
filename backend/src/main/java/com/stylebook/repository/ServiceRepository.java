package com.stylebook.repository;

import com.stylebook.entity.Service;
import com.stylebook.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {

    List<Service> findByShopAndIsActiveTrue(Shop shop);

    List<Service> findByShop(Shop shop);

    void deleteByShopAndId(Shop shop, UUID id);
}