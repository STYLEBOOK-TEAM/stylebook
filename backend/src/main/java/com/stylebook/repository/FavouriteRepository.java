package com.stylebook.repository;

import com.stylebook.entity.Favourite;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavouriteRepository extends JpaRepository<Favourite, UUID> {

    List<Favourite> findByCustomer(User customer);

    Optional<Favourite> findByCustomerAndShop(User customer, Shop shop);

    boolean existsByCustomerAndShop(User customer, Shop shop);

    void deleteByCustomerAndShop(User customer, Shop shop);
}